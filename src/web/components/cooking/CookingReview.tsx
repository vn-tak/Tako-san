import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RecipeScoringContext } from '@frigo/recipes';
import { ArrowLeft, Check, Refrigerator, Minus, Plus } from 'lucide-react';
import { useCookingStore } from '../../stores/useCookingStore';
import { cookingQuantityText, cookingUnitLabel } from '../../lib/cooking-review';
import { submitCookingCompletion } from '../../lib/cooking-completion';
import { fetchJson } from '../../services/http';
import { capturePrivateSession } from '../../lib/private-session';
import { TAKOSAN_KITCHEN } from '../../lib/takosan-kitchen';

export function CookingReview() {
  const state = useCookingStore();
  const { activeRecipe: recipe, deductions, deductionInputs, deductionErrors, attempt } = state;
  const heading = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const mounted = useRef(false);
  const refreshing = useRef(false);
  const [refreshStatus, setRefreshStatus] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const locked = Boolean(attempt);
  const done = attempt?.status === 'saved' || attempt?.status === 'queued';
  useEffect(() => {
    mounted.current = true;
    useCookingStore.getState().clearTimer();
    heading.current?.focus();
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (done) heading.current?.focus();
  }, [done]);
  useEffect(() => {
    if (attempt?.error) errorRef.current?.focus();
  }, [attempt?.error]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!done) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [done]);
  if (!recipe) return null;

  const refresh = async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setIsRefreshing(true);
    setRefreshStatus('Đang tải lượng trong tủ…');
    const isCurrent = capturePrivateSession();
    const runId = state.runId;
    const current = () =>
      mounted.current && isCurrent() && useCookingStore.getState().runId === runId;
    try {
      // No cache fallback: this copy promises an authoritative server read.
      const result = await fetchJson<{ items: RecipeScoringContext['inventory'] }>('/inventory');
      if (!Array.isArray(result.items)) throw new Error('Invalid inventory');
      if (!current()) return;
      state.refreshStock(result.items);
      setRefreshStatus(
        'Đã tải lại lượng trong tủ. Lượng đã dùng của bạn được giữ nguyên; kiểm tra trước khi gửi lại.',
      );
    } catch {
      if (current())
        setRefreshStatus(
          'Chưa tải lại được lượng trong tủ. Hãy kiểm tra kết nối rồi thử tải lại; lượng đã gửi vẫn khóa.',
        );
    } finally {
      refreshing.current = false;
      if (current()) setIsRefreshing(false);
    }
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = deductionErrors.findIndex(Boolean);
    if (invalid >= 0) {
      document.getElementById(`cooking-use-${invalid}`)?.focus();
      return;
    }
    void submitCookingCompletion();
  };
  const adjust = (index: number, direction: number) => {
    const line = deductions[index];
    const step = ['kg', 'l'].includes(line.unit) ? 0.1 : ['g', 'ml'].includes(line.unit) ? 10 : 1;
    const input = deductionInputs[index];
    if (input.trim() === '' || !Number.isFinite(Number(input))) return;
    state.editDeduction(
      index,
      String(Math.max(0, Number((Number(input) + direction * step).toFixed(9)))),
    );
  };
  return (
    <div className="cooking-review">
      <header className="cooking-review-header">
        {!locked && (
          <Link className="cooking-control" to={`/cook/${recipe.slug}`}>
            <ArrowLeft aria-hidden="true" size={18} /> Quay lại bước nấu
          </Link>
        )}
        <img src={TAKOSAN_KITCHEN.logo} width={300} height={72} className="cooking-brand" alt="Takosan" translate="no" />
      </header>
      <form onSubmit={submit} noValidate className="cooking-review-grid">
        <div className="cooking-review-intro">
          <span className="cooking-eyebrow">
            {done ? 'Ghi nhận bữa nấu' : 'Bước cuối · Kiểm tra lượng'}
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {done
              ? attempt.status === 'queued'
                ? 'Đã lưu trên thiết bị'
                : 'Đã cập nhật tủ lạnh'
              : 'Món ăn hoàn tất'}
          </h1>
          <p className="cooking-dish-title">{recipe.title}</p>
          <p>
            {done
              ? attempt.status === 'queued'
                ? 'Yêu cầu đang chờ đồng bộ. Chưa xác nhận kết quả trên máy chủ; hãy kiểm tra trạng thái đồng bộ trong Tủ lạnh khi có mạng.'
                : 'Máy chủ đã ghi nhận bữa nấu và cập nhật lượng nguyên liệu.'
              : 'Nhập lượng bạn thực sự đã dùng. Tủ lạnh chỉ được cập nhật sau khi bạn xác nhận.'}
          </p>
          <div className="cooking-review-note">
            <Refrigerator aria-hidden="true" size={24} />
            <p>
              Lượng còn lại là dự kiến từ dữ liệu lúc mở món. Máy chủ kiểm tra lại số lượng khi nhận
              yêu cầu.
            </p>
          </div>
          {attempt?.error && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="cooking-error">
              {attempt.error}
            </p>
          )}
          <p role="status" className="cooking-feedback">
            {refreshStatus}
          </p>
          {attempt?.status === 'rejected' && (
            <button
              type="button"
              className="cooking-control"
              disabled={isRefreshing}
              onClick={() => void refresh()}
            >
              {isRefreshing ? 'Đang tải lại…' : 'Tải lại lượng trong tủ để kiểm tra'}
            </button>
          )}
          {attempt?.status === 'restricted' && (
            <Link className="cooking-control" to="/recipes" onClick={() => state.resetCooking()}>
              Kết thúc và chọn món khác
            </Link>
          )}
          {attempt?.status === 'blocked' && (
            <Link className="cooking-control" to="/fridge">
              Kiểm tra Tủ lạnh
            </Link>
          )}
          {attempt?.status === 'uncertain' && (
            <button type="submit" className="cooking-primary">
              Thử lại cùng yêu cầu
            </button>
          )}
          {attempt?.status === 'sending' && <p role="status">Đang gửi yêu cầu hoàn tất…</p>}
          {done && (
            <Link className="cooking-primary" to="/fridge" onClick={() => state.resetCooking()}>
              <Check aria-hidden="true" size={20} /> Xem Tủ lạnh
            </Link>
          )}
        </div>
        <section className="cooking-use-list" aria-labelledby="cooking-use-title">
          <h2 id="cooking-use-title">Lượng thực dùng</h2>
          <p>Nhập 0 cho nguyên liệu không dùng. Có thể nhập số lẻ.</p>
          {deductions.length === 0 && (
            <p>Món này chưa có danh sách nguyên liệu; xác nhận chỉ ghi nhận bữa nấu.</p>
          )}
          {deductions.map((line, index) => (
            <div className="cooking-use-row" key={`${line.ingredientId}-${index}`}>
              <label htmlFor={`cooking-use-${index}`}>{line.name}</label>
              <p>
                Trong tủ: {cookingQuantityText(line.currentQuantity, line.unit)} · Còn dự kiến:{' '}
                {deductionErrors[index]
                  ? 'Chưa xác định'
                  : cookingQuantityText(line.remainingQuantity, line.unit)}
              </p>
              <div className="cooking-use-controls">
                <button
                  type="button"
                  aria-label={`Giảm lượng ${line.name}`}
                  disabled={
                    locked ||
                    deductionInputs[index].trim() === '' ||
                    Number(deductionInputs[index]) <= 0
                  }
                  onClick={() => adjust(index, -1)}
                >
                  <Minus aria-hidden="true" size={18} />
                </button>
                <input
                  id={`cooking-use-${index}`}
                  name={`quantity-${index}`}
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  min="0"
                  max="100000"
                  step="any"
                  disabled={locked}
                  aria-label={`Lượng đã dùng: ${line.name}`}
                  aria-invalid={Boolean(deductionErrors[index])}
                  aria-describedby={`cooking-use-hint-${index}`}
                  value={deductionInputs[index] ?? ''}
                  onChange={(event) => state.editDeduction(index, event.target.value)}
                />
                <span>{cookingUnitLabel(line.unit)}</span>
                <button
                  type="button"
                  aria-label={`Tăng lượng ${line.name}`}
                  disabled={
                    locked ||
                    deductionInputs[index].trim() === '' ||
                    Number(deductionInputs[index]) >= Math.min(100000, line.currentQuantity)
                  }
                  onClick={() => adjust(index, 1)}
                >
                  <Plus aria-hidden="true" size={18} />
                </button>
              </div>
              <p
                id={`cooking-use-hint-${index}`}
                className={deductionErrors[index] ? 'cooking-error' : 'cooking-use-hint'}
                aria-live="polite"
              >
                {deductionErrors[index] ?? 'Lượng đã dùng tính theo đơn vị của công thức.'}
              </p>
            </div>
          ))}
          {!attempt && (
            <div className="cooking-review-action">
              <button
                type="submit"
                className="cooking-primary"
                disabled={deductionErrors.some(Boolean)}
              >
                Xác nhận &amp; Cập nhật tủ lạnh
              </button>
              <p>Bạn xác nhận đúng lượng thực dùng ở trên.</p>
            </div>
          )}
        </section>
      </form>
    </div>
  );
}
