import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCookingStore } from '../stores/useCookingStore';
import { api } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import { InlineError, InlineLoading } from '../components/common/AsyncState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CookingReview } from '../components/cooking/CookingReview';
import { audioEffects } from '../lib/audio-effects';
import { voiceChef } from '../lib/voice-chef';
import { capturePrivateSession } from '../lib/private-session';
import { TAKOSAN_KITCHEN } from '../lib/takosan-kitchen';

export const CookingModePage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const recipeKey = slug || id || '';
  return <CookingLoader key={recipeKey} recipeKey={recipeKey} />;
};

function CookingLoader({ recipeKey }: { recipeKey: string }) {
  const { activeRecipe, runId, startCooking, attempt } = useCookingStore();
  const matches = Boolean(
    activeRecipe && (activeRecipe.slug === recipeKey || activeRecipe.id === recipeKey),
  );
  const blockedRun = Boolean(attempt && !['saved', 'queued'].includes(attempt.status));
  const recipeQuery = useQuery({
    queryKey: queryKeys.recipe(recipeKey),
    queryFn: () => api.getRecipeById(recipeKey),
    enabled: Boolean(recipeKey) && !matches && !blockedRun,
  });
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory(),
    queryFn: () => api.getInventory(),
    enabled: Boolean(recipeKey) && !matches && !blockedRun,
  });
  useEffect(() => {
    if (!matches && !blockedRun && recipeQuery.data?.recipe && inventoryQuery.data)
      startCooking(recipeQuery.data.recipe, inventoryQuery.data);
  }, [matches, blockedRun, recipeQuery.data, inventoryQuery.data, startCooking]);
  if (blockedRun && !matches)
    return (
      <div className="cooking-empty">
        <h1>Cần kiểm tra lần nấu trước</h1>
        <p>
          Bạn còn một yêu cầu hoàn tất cho {activeRecipe?.title}. Kiểm tra kết quả trước khi bắt đầu
          món khác để tránh gửi thêm lần trừ nguyên liệu.
        </p>
        <Link className="cooking-primary" to="/cooking/complete">
          Kiểm tra yêu cầu trước
        </Link>
      </div>
    );
  if (matches && attempt) return <CookingReview key={runId} />;
  if (!matches || !runId) {
    const error = recipeQuery.error || inventoryQuery.error;
    return (
      <div className="cooking-empty">
        {error ? (
          <InlineError
            error={error}
            onRetry={() => {
              void recipeQuery.refetch();
              void inventoryQuery.refetch();
            }}
          />
        ) : !recipeKey || (recipeQuery.isSuccess && !recipeQuery.data?.recipe) ? (
          <h1>Không tìm thấy công thức này</h1>
        ) : (
          <InlineLoading label="Đang tải bước nấu…" />
        )}
        <Link className="cooking-control" to="/recipes">
          Xem công thức
        </Link>
      </div>
    );
  }
  return <CookingSteps key={runId} />;
}

function CookingSteps() {
  const state = useCookingStore();
  const {
    activeRecipe: recipe,
    currentStepIndex: index,
    timerSecondsRemaining: remaining,
    isTimerRunning: running,
    timerGeneration,
    runId,
  } = state;
  const navigate = useNavigate();
  const [confirmExit, setConfirmExit] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [announcement, setAnnouncement] = useState({ text: '', sequence: 0 });
  const [direction, setDirection] = useState(1);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);
  const voiceGeneration = useRef(0);
  const heardTimeout = useRef<ReturnType<typeof setTimeout>>();
  const alertedGeneration = useRef(-1);
  const currentStep = recipe?.steps[index];
  const announce = (text: string) =>
    setAnnouncement((previous) => ({ text, sequence: previous.sequence + 1 }));

  useEffect(() => {
    mounted.current = true;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      mounted.current = false;
      voiceGeneration.current++;
      clearTimeout(heardTimeout.current);
      voiceChef.stopSpeaking();
      voiceChef.stopListening();
      window.removeEventListener('beforeunload', warn);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    const tick = () => state.tickTimer();
    const interval = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [running, state.tickTimer]);
  useEffect(() => {
    if (remaining !== 0 || alertedGeneration.current === timerGeneration) return;
    alertedGeneration.current = timerGeneration;
    announce('Hẹn giờ đã kết thúc.');
    audioEffects.playTimerAlertSound();
    navigator.vibrate?.([200, 100, 200]);
  }, [remaining, timerGeneration]);
  useEffect(() => {
    voiceChef.stopSpeaking();
    setSpeaking(false);
    setAnnouncement({ text: '', sequence: 0 });
  }, [index]);

  const ownsRun = () => mounted.current && useCookingStore.getState().runId === runId;
  const speakCurrent = () => {
    const live = useCookingStore.getState();
    const step = live.activeRecipe?.steps[live.currentStepIndex];
    if (!ownsRun() || !step) return;
    const speakingStep = live.currentStepIndex;
    const ok = voiceChef.speakInstruction(step.instruction, () => {
      if (ownsRun() && useCookingStore.getState().currentStepIndex === speakingStep)
        setSpeaking(false);
    });
    setSpeaking(ok);
    if (!ok)
      setVoiceStatus(
        'Không thể đọc giọng nói trên trình duyệt này. Bạn có thể đọc hướng dẫn và dùng các nút bên dưới.',
      );
  };
  const startTimer = () => {
    const live = useCookingStore.getState();
    const minutes = live.activeRecipe?.steps[live.currentStepIndex]?.timerMinutes;
    if (!ownsRun() || !minutes) return;
    const starting = live.timerSecondsRemaining === null;
    live.setTimer(minutes * 60);
    announce(starting ? 'Đã bắt đầu hẹn giờ.' : 'Đã đặt lại hẹn giờ.');
  };
  const toggleTimer = () => {
    const live = useCookingStore.getState();
    live.tickTimer();
    if (!ownsRun() || useCookingStore.getState().timerSecondsRemaining === 0) return;
    const pausing = live.isTimerRunning;
    live.toggleTimer();
    announce(pausing ? 'Đã tạm dừng hẹn giờ.' : 'Đã tiếp tục hẹn giờ.');
  };
  const changeStep = (delta: number) => {
    if (!ownsRun()) return;
    setDirection(delta);
    audioEffects.playStepClickSound();
    const live = useCookingStore.getState();
    if (delta > 0) live.nextStep();
    else live.prevStep();
  };
  const toggleListening = () => {
    if (listening) {
      voiceGeneration.current++;
      voiceChef.stopListening();
      clearTimeout(heardTimeout.current);
      setHeard('');
      setListening(false);
      setVoiceStatus('Trợ lý rảnh tay đã tắt.');
      return;
    }
    const generation = ++voiceGeneration.current;
    const isCurrent = capturePrivateSession();
    const valid = () => ownsRun() && isCurrent() && voiceGeneration.current === generation;
    setListening(true);
    setVoiceStatus('Trợ lý rảnh tay đã bật.');
    voiceChef.startListening({
      onNext: () => {
        if (valid()) changeStep(1);
      },
      onPrev: () => {
        if (valid()) changeStep(-1);
      },
      onRepeat: () => {
        if (valid()) speakCurrent();
      },
      onStartTimer: () => {
        if (valid()) startTimer();
      },
      onPauseTimer: () => {
        if (valid() && useCookingStore.getState().isTimerRunning) toggleTimer();
      },
      onHeardCommand: (text) => {
        if (!valid()) return;
        setHeard(text);
        clearTimeout(heardTimeout.current);
        heardTimeout.current = setTimeout(() => {
          if (valid()) setHeard('');
        }, 3000);
      },
      onError: () => {
        if (!valid()) return;
        voiceGeneration.current++;
        voiceChef.stopListening();
        setListening(false);
        setVoiceStatus(
          'Trợ lý rảnh tay đã tắt. Không thể nghe khẩu lệnh; bạn vẫn có thể dùng các nút điều khiển.',
        );
      },
    });
  };
  const complete = () => {
    state.clearTimer();
    navigate('/cooking/complete');
  };
  if (!recipe) return null;
  if (!currentStep)
    return (
      <div className="cooking-empty">
        <h1>Công thức chưa có bước nấu</h1>
        <p>Bạn có thể xem lại công thức hoặc kiểm tra lượng thực dùng nếu đã nấu món này.</p>
        <Link className="cooking-control" to={`/recipes/${recipe.slug}`}>
          Xem lại công thức
        </Link>
        <button className="cooking-primary" onClick={complete}>
          Kiểm tra lượng thực dùng
        </button>
      </div>
    );
  const last = index === recipe.steps.length - 1;
  const countdown =
    remaining === null
      ? ''
      : `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  return (
    <div className="cooking-workspace">
      <header className="cooking-header">
        <button
          className="cooking-control"
          onClick={() => setConfirmExit(true)}
          aria-label="Thoát chế độ nấu"
        >
          <ArrowLeft aria-hidden="true" size={20} />
          <span>Thoát</span>
        </button>
        <img src={TAKOSAN_KITCHEN.logo} width={300} height={72} className="cooking-brand" alt="Takosan" translate="no" />
        <span className="cooking-eyebrow">Bếp nhà</span>
      </header>
      <div className="cooking-workspace-grid">
        <aside className="cooking-context">
          <span className="cooking-eyebrow">Đang nấu</span>
          <h1>{recipe.title}</h1>
          <p>
            Bước {index + 1} / {recipe.steps.length} · {recipe.cookTimeMinutes} phút theo công thức
          </p>
          <div
            className="cooking-progress"
            role="progressbar"
            aria-label="Tiến trình nấu ăn"
            aria-valuemin={1}
            aria-valuemax={recipe.steps.length}
            aria-valuenow={index + 1}
            aria-valuetext={`Bước ${index + 1} trên ${recipe.steps.length}`}
          >
            <span style={{ transform: `scaleX(${(index + 1) / recipe.steps.length})` }} />
          </div>
          <details className="cooking-outline">
            <summary>Các bước của món này</summary>
            <ol>
              {recipe.steps.map((step, stepIndex) => (
                <li key={stepIndex} aria-current={index === stepIndex ? 'step' : undefined}>
                  <span>{stepIndex + 1}</span>
                  <p>{step.instruction}</p>
                </li>
              ))}
            </ol>
          </details>
          <div className="cooking-voice-controls">
            <button
              className="cooking-control"
              onClick={toggleListening}
              aria-pressed={listening}
              aria-label={listening ? 'Tắt trợ lý rảnh tay' : 'Bật trợ lý rảnh tay'}
            >
              {listening ? (
                <Mic aria-hidden="true" size={18} />
              ) : (
                <MicOff aria-hidden="true" size={18} />
              )}
              {listening ? 'Tắt khẩu lệnh' : 'Bật khẩu lệnh'}
            </button>
            <button
              className="cooking-control"
              onClick={() => {
                if (speaking) {
                  voiceChef.stopSpeaking();
                  setSpeaking(false);
                } else speakCurrent();
              }}
              aria-label={speaking ? 'Dừng đọc' : 'Đọc to bước này'}
            >
              {speaking ? (
                <VolumeX aria-hidden="true" size={18} />
              ) : (
                <Volume2 aria-hidden="true" size={18} />
              )}
              {speaking ? 'Dừng đọc' : 'Đọc bước này'}
            </button>
          </div>
          <p role="status" data-testid="cooking-listening-status" className="cooking-feedback">
            {voiceStatus}
          </p>
          {listening && (
            <p className="cooking-voice-guide">
              Nói “tiếp”, “lùi”, “đọc lại”, “hẹn giờ” hoặc “tạm dừng”. Khẩu lệnh không xác nhận trừ
              nguyên liệu.
            </p>
          )}
          <p role="status" data-testid="cooking-heard-status" className="cooking-feedback">
            {heard ? `Đã nghe: ${heard}` : ''}
          </p>
        </aside>
        <section className="cooking-stage" aria-label="Bước nấu hiện tại">
          <p
            role="status"
            className="sr-only"
            data-testid="cooking-step-status"
          >{`Bước ${index + 1} trên ${recipe.steps.length}. ${currentStep.instruction}`}</p>
          <p role="status" className="sr-only" data-testid="cooking-timer-status">
            <span key={announcement.sequence}>{announcement.text}</span>
          </p>
          <div
            className="cooking-step"
            key={index}
            style={{ '--step-direction': direction } as React.CSSProperties}
          >
            <span className="cooking-step-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2>Bước {index + 1}</h2>
            <p className="cooking-instruction">{currentStep.instruction}</p>
            {currentStep.tip && (
              <p className="cooking-tip">
                <strong>Mẹo trong công thức</strong>
                <br />
                {currentStep.tip}
              </p>
            )}
          </div>
          {Boolean(currentStep.timerMinutes) && (
            <div className="cooking-timer-region">
              <h3>
                <Clock aria-hidden="true" size={18} /> Hẹn giờ cho bước này
              </h3>
              {remaining === null ? (
                <button
                  className="cooking-control"
                  onClick={() => {
                    startTimer();
                    requestAnimationFrame(() => toggleRef.current?.focus());
                  }}
                >
                  Bật hẹn giờ ({currentStep.timerMinutes} phút)
                </button>
              ) : (
                <div className="cooking-timer">
                  <span className="cooking-countdown" data-testid="cooking-countdown">
                    {countdown}
                  </span>
                  <div className="cooking-timer-controls">
                    <button
                      ref={toggleRef}
                      className="cooking-control"
                      onClick={toggleTimer}
                      aria-disabled={remaining === 0}
                      aria-label={
                        remaining === 0
                          ? 'Hẹn giờ đã kết thúc'
                          : running
                            ? 'Tạm dừng hẹn giờ'
                            : 'Tiếp tục hẹn giờ'
                      }
                    >
                      {running ? (
                        <Pause aria-hidden="true" size={20} />
                      ) : (
                        <Play aria-hidden="true" size={20} />
                      )}
                    </button>
                    <button
                      className="cooking-control"
                      aria-label="Đặt lại hẹn giờ"
                      onClick={startTimer}
                    >
                      <RotateCcw aria-hidden="true" size={20} />
                    </button>
                  </div>
                </div>
              )}
              <p>
                {remaining === 0
                  ? 'Đã hết giờ. Kiểm tra món trước khi chuyển bước.'
                  : 'Chuyển bước sẽ đặt lại hẹn giờ. Âm báo phụ thuộc trình duyệt và thiết bị.'}
              </p>
            </div>
          )}
          <div className="cooking-step-actions">
            <button
              className="cooking-control"
              disabled={index === 0}
              onClick={() => changeStep(-1)}
            >
              <ArrowLeft aria-hidden="true" size={18} /> Bước trước
            </button>
            <button className="cooking-primary" onClick={last ? complete : () => changeStep(1)}>
              {last ? <Check aria-hidden="true" size={20} /> : null}
              {last ? 'Hoàn thành nấu' : 'Bước tiếp theo'}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={confirmExit}
        title="Thoát chế độ nấu?"
        description="Tiến trình và hẹn giờ sẽ được đặt lại. Tủ lạnh chưa bị trừ nguyên liệu."
        confirmText="Thoát"
        destructive
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => {
          state.resetCooking();
          navigate(`/recipes/${recipe.slug}`);
        }}
      />
    </div>
  );
}
