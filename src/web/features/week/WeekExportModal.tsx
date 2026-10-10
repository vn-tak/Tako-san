import { useEffect, useId, useRef, useState } from 'react';
import { X, Copy, Share2 } from 'lucide-react';
import type { MealPlan, AggregatedShoppingItem } from '@frigo/domain';
import { useModalFocus } from '../../design-system/use-modal-focus';

interface WeekExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MealPlan;
  shoppingItems?: AggregatedShoppingItem[];
}
export function WeekExportModal({
  isOpen,
  onClose,
  plan,
  shoppingItems = [],
}: WeekExportModalProps) {
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const [pending, setPending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const epoch = useRef(0);
  const busy = useRef(false);
  const titleId = useId();
  useModalFocus(isOpen, panelRef, onClose, closeRef);
  useEffect(() => {
    epoch.current += 1;
    busy.current = false;
    setPending(false);
    setFeedback(null);
    return () => {
      epoch.current += 1;
    };
  }, [isOpen, plan.id]);
  useEffect(() => {
    if (feedback?.error) feedbackRef.current?.focus();
  }, [feedback]);
  if (!isOpen) return null;
  const totalMeals = plan.days.reduce((count, day) => count + day.slots.length, 0);

  // Generate Menu text
  const generateMenuText = () => {
    const lines = [
      `🥗 THỰC ĐƠN TUẦN NÀY (${totalMeals} bữa)`,
      `💰 Ngân sách: ${plan.budget.displayText} | Tận dụng tủ: ${plan.utilization.utilizationPercent}%`,
      '--------------------------------',
    ];

    plan.days.forEach((day) => {
      const mealNames = day.slots
        .map((s) => {
          const slotLabel =
            s.slotType === 'dinner'
              ? 'Tối'
              : s.slotType === 'lunch'
                ? 'Trưa'
                : s.slotType === 'breakfast'
                  ? 'Sáng'
                  : 'Phụ';
          return `${slotLabel}: ${s.recipe?.title || 'Tự chọn'}`;
        })
        .join(' | ');
      lines.push(`• ${day.dayNameVi}: ${mealNames || 'Tự do'}`);
    });

    lines.push('--------------------------------');
    lines.push('Lên bởi Takosan Week — Ăn đủ. Mua đủ. Dùng hết.');
    return lines.join('\n');
  };

  // Generate Shopping list text
  const generateShoppingText = () => {
    const lines = [
      `🛒 DANH SÁCH ĐI CHỢ TUẦN (${shoppingItems.length} món)`,
      `💰 Dự kiến: ${plan.budget.displayText}`,
      '--------------------------------',
    ];

    const categoryNames: Record<string, string> = {
      produce: '🥦 Rau củ quả tươi',
      meat_seafood: '🥩 Thịt & Hải sản',
      dairy_eggs: '🥚 Trứng & Sữa',
      spices_oils: '🧂 Gia vị & Dầu ăn',
      grains_dry: '🌾 Gạo & Đồ khô',
      frozen: '❄️ Đồ đông lạnh',
      other: '📦 Khác',
    };

    const grouped: Record<string, AggregatedShoppingItem[]> = {};
    shoppingItems.forEach((it) => {
      const cat = it.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(it);
    });

    Object.entries(grouped).forEach(([cat, items]) => {
      lines.push(`\n${categoryNames[cat] || cat}:`);
      items.forEach((it) => {
        const qty = it.recommendedPurchaseQuantity || it.missingQuantity;
        lines.push(` [ ] ${it.name}: ${qty} ${it.unit}`);
      });
    });

    lines.push('\n--------------------------------');
    lines.push('Tạo bởi Takosan — frigo.tungjpstore.net');
    return lines.join('\n');
  };

  async function copy(kind: 'menu' | 'shopping') {
    if (busy.current) return;
    const owner = epoch.current;
    busy.current = true;
    setPending(true);
    setFeedback(null);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(
        kind === 'menu' ? generateMenuText() : generateShoppingText(),
      );
      if (epoch.current === owner)
        setFeedback({
          message: kind === 'menu' ? 'Đã sao chép thực đơn.' : 'Đã sao chép danh sách đi chợ.',
          error: false,
        });
    } catch {
      if (epoch.current === owner)
        setFeedback({
          message: 'Chưa sao chép được. Hãy kiểm tra quyền sao chép của trình duyệt rồi thử lại.',
          error: true,
        });
    } finally {
      if (epoch.current === owner) {
        busy.current = false;
        setPending(false);
      }
    }
  }
  async function share() {
    if (busy.current) return;
    if (!navigator.share) {
      await copy('shopping');
      return;
    }
    const owner = epoch.current;
    busy.current = true;
    setPending(true);
    setFeedback(null);
    try {
      await navigator.share({
        title: 'Thực đơn & Danh sách đi chợ tuần Takosan',
        text: `${generateMenuText()}\n\n${generateShoppingText()}`,
      });
      if (epoch.current === owner)
        setFeedback({ message: 'Đã hoàn tất thao tác chia sẻ trên thiết bị.', error: false });
    } catch (error) {
      if (epoch.current === owner)
        setFeedback({
          message:
            (error instanceof Error || error instanceof DOMException) && error.name === 'AbortError'
              ? 'Bạn đã đóng bảng chia sẻ.'
              : 'Chưa chia sẻ được. Bạn có thể sao chép nội dung để gửi.',
          error: !(
            (error instanceof Error || error instanceof DOMException) &&
            error.name === 'AbortError'
          ),
        });
    } finally {
      if (epoch.current === owner) {
        busy.current = false;
        setPending(false);
      }
    }
  }
  return (
    <div className="week-modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="week-dialog"
      >
        <div className="week-dialog-heading">
          <div>
            <p className="week-eyebrow">CÙNG XEM, CÙNG CHUẨN BỊ</p>
            <h2 id={titleId}>Chia sẻ thực đơn tuần</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="week-icon-button"
            onClick={onClose}
            aria-label="Đóng chia sẻ"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="week-dialog-body">
          <p className="week-muted">
            Sao chép nội dung rồi gửi qua ứng dụng bạn chọn. Giá và mức tận dụng tủ trong bản chia
            sẻ là dự kiến.
          </p>
          <div className="week-export-preview">
            <h3>
              {totalMeals} bữa · {shoppingItems.length} nguyên liệu cần mua
            </h3>
            <p>{plan.budget.displayText}</p>
            <ul>
              {plan.days.map((day) => (
                <li key={day.id}>
                  <strong>{day.dayNameVi}</strong>
                  <span>
                    {day.slots.map((slot) => slot.recipe?.title || 'Tự chọn').join(' · ') ||
                      'Tự do'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="week-actions week-export-actions">
            <button
              type="button"
              className="week-button week-button-secondary"
              disabled={pending}
              onClick={() => copy('shopping')}
            >
              <Copy size={18} aria-hidden="true" />
              Sao chép danh sách đi chợ
            </button>
            <button
              type="button"
              className="week-button week-button-secondary"
              disabled={pending}
              onClick={() => copy('menu')}
            >
              <Copy size={18} aria-hidden="true" />
              Sao chép thực đơn
            </button>
            <button type="button" className="week-button" disabled={pending} onClick={share}>
              <Share2 size={18} aria-hidden="true" />
              {typeof navigator.share === 'function'
                ? 'Chia sẻ trên thiết bị'
                : 'Sao chép danh sách để gửi'}
            </button>
          </div>
          {pending && (
            <p role="status" className="week-muted">
              Đang chờ kết quả từ thiết bị…
            </p>
          )}
          {feedback && (
            <p
              ref={feedbackRef}
              tabIndex={feedback.error ? -1 : undefined}
              role={feedback.error ? 'alert' : 'status'}
              className={feedback.error ? 'week-error' : 'week-note'}
            >
              {feedback.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
