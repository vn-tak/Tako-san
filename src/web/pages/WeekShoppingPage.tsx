import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Check, Refrigerator } from 'lucide-react';
import { mapCategoryToShoppingSection, type AggregatedShoppingItem } from '@frigo/domain';
import { useWeekStore } from '../stores/useWeekStore';
import { WeekWorkspace, weekCurrency } from '../features/week/WeekWorkspace';
import { InlineError, InlineLoading } from '../components/common/AsyncState';
import { getIngredientImage } from '../lib/ingredient-images';
import { capturePrivateSession } from '../lib/private-session';
import { queryKeys } from '../lib/queryKeys';
import { api } from '../services/api';

type Completion = { items: AggregatedShoppingItem[]; count: number; pendingSync?: boolean };
export function WeekShoppingPage() {
  const { planId } = useParams<{ planId: string }>();
  const { error: workflowError, toggleShoppingItem, completeShopping } = useWeekStore();
  const [shoppingMode, setShoppingMode] = useState<'list' | 'active' | 'complete'>('list');
  const [selectedSection, setSelectedSection] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completedShopping, setCompletedShopping] = useState<Completion | null>(null);
  const lifecycle = useRef(0);
  const submitting = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const planQuery = useQuery({
    queryKey: queryKeys.weekPlan(planId || ''),
    queryFn: () => api.getWeekPlan(planId!),
    enabled: Boolean(planId),
  });
  const currentPlan = planQuery.data ?? null;
  useEffect(() => {
    if (currentPlan) useWeekStore.setState({ currentPlan });
  }, [currentPlan]);
  useEffect(() => {
    lifecycle.current += 1;
    submitting.current = false;
    setShoppingMode('list');
    setSelectedSection('all');
    setIsSubmitting(false);
    setCompletionError(null);
    setCompletedShopping(null);
    return () => {
      lifecycle.current += 1;
    };
  }, [planId]);
  useEffect(() => {
    if (completionError) errorRef.current?.focus();
  }, [completionError]);
  useEffect(() => {
    if (completedShopping) completionRef.current?.focus();
  }, [completedShopping]);
  const items = currentPlan?.shoppingItems ?? [];
  const checkedItems = items.filter((item) => item.checked);
  const sections = [...new Set(items.map((item) => mapCategoryToShoppingSection(item.category)))];
  const filteredItems =
    selectedSection === 'all'
      ? items
      : items.filter((item) => mapCategoryToShoppingSection(item.category) === selectedSection);
  const backTo = planId ? `/week/${planId}` : '/week';

  async function finishShopping() {
    if (submitting.current || !checkedItems.length) return;
    const isCurrentSession = capturePrivateSession();
    const owner = lifecycle.current;
    const isCurrent = () => isCurrentSession() && lifecycle.current === owner;
    const submittedItems = checkedItems.map((item) => ({ ...item }));
    submitting.current = true;
    setCompletionError(null);
    setIsSubmitting(true);
    try {
      const result = await completeShopping();
      if (!isCurrent()) return;
      if (!result.success) throw new Error('Shopping not completed');
      setCompletedShopping({
        items: submittedItems,
        count: result.count,
        pendingSync: result.pendingSync,
      });
      setShoppingMode('complete');
    } catch {
      if (isCurrent())
        setCompletionError('Chưa nhập được nguyên liệu vào tủ lạnh. Vui lòng thử lại.');
    } finally {
      if (isCurrent()) {
        submitting.current = false;
        setIsSubmitting(false);
      }
    }
  }

  if (shoppingMode === 'complete' && completedShopping) {
    const pending = completedShopping.pendingSync === true;
    return (
      <WeekWorkspace
        title={pending ? 'Yêu cầu nhập đang chờ đồng bộ.' : 'Đã nhập nguyên liệu vào tủ.'}
        backTo={backTo}
        narrow
        description={
          pending
            ? 'Máy chủ chưa xác nhận nhập hàng. Kiểm tra lại tủ và trạng thái đồng bộ khi có kết nối.'
            : `Đã nhận xác nhận nhập ${completedShopping.count} nguyên liệu. Bạn có thể xem lại số lượng trong tủ.`
        }
      >
        <div className="week-paper week-completion" ref={completionRef} tabIndex={-1} role="status">
          <h2>{pending ? 'Nguyên liệu trong yêu cầu' : 'Nguyên liệu đã chọn'}</h2>
          <ul className="week-completion-list">
            {completedShopping.items.map((item) => (
              <li key={item.ingredientId}>
                <span>{item.name}</span>
                <strong>
                  {item.recommendedPurchaseQuantity} {item.unit}
                </strong>
              </li>
            ))}
          </ul>
          <p className="week-muted">
            Chỉ những nguyên liệu bạn đã chọn được gửi trong lần xác nhận này.
          </p>
          <div className="week-actions">
            <Link to="/fridge" className="week-button">
              <Refrigerator size={18} aria-hidden="true" />
              Xem tủ lạnh
            </Link>
            <Link to={backTo} className="week-button week-button-secondary">
              Về thực đơn tuần
            </Link>
          </div>
        </div>
      </WeekWorkspace>
    );
  }
  return (
    <WeekWorkspace
      title={
        shoppingMode === 'active' ? 'Đi chợ, từng nguyên liệu một.' : 'Mua thêm vừa đủ cho tuần.'
      }
      backTo={backTo}
      description="Đánh dấu nguyên liệu đã mua. Chỉ khi xác nhận nhập, các nguyên liệu được chọn mới được gửi vào tủ."
    >
      {planQuery.isError ? (
        <InlineError error={planQuery.error} onRetry={() => planQuery.refetch()} />
      ) : !currentPlan ? (
        planQuery.isPending ? (
          <InlineLoading label="Đang tải danh sách đi chợ…" />
        ) : (
          <p role="status">Không tìm thấy thực đơn này.</p>
        )
      ) : (
        <>
          {(completionError || workflowError) && (
            <p role="alert" tabIndex={-1} ref={errorRef} className="week-error">
              {completionError || workflowError}
            </p>
          )}
          <div className="week-shopping-summary week-paper">
            <div>
              <p className="week-eyebrow">MUA THÊM · ƯỚC TÍNH</p>
              <h2>{currentPlan.budget.displayText || 'Chưa có ước tính giá'}</h2>
              <p className="week-muted">
                Giá thực tế có thể khác; giá bằng 0 trong kế hoạch có thể do thiếu dữ liệu.
              </p>
            </div>
            <p role="status">
              Đã chọn{' '}
              <strong>
                {checkedItems.length}/{items.length}
              </strong>{' '}
              nguyên liệu
            </p>
          </div>
          {!items.length ? (
            <section className="week-paper week-empty">
              <h2>Chưa có nguyên liệu cần mua thêm</h2>
              <p className="week-muted">Kiểm tra lại tủ và nguyên liệu từng bữa trước khi nấu.</p>
              <Link to={backTo} className="week-button week-button-secondary">
                Về thực đơn tuần
              </Link>
            </section>
          ) : (
            <>
              <div className="week-shopping-filters" role="group" aria-label="Nhóm nguyên liệu">
                {['all', ...sections].map((section) => (
                  <button
                    key={section}
                    type="button"
                    className="week-button week-button-secondary"
                    aria-pressed={selectedSection === section}
                    onClick={() => setSelectedSection(section)}
                  >
                    {section === 'all' ? 'Tất cả' : section} (
                    {section === 'all'
                      ? items.length
                      : items.filter(
                          (item) => mapCategoryToShoppingSection(item.category) === section,
                        ).length}
                    )
                  </button>
                ))}
              </div>
              <ul className="week-shopping-list">
                {filteredItems.map((item) => (
                  <li key={item.ingredientId}>
                    <button
                      type="button"
                      aria-pressed={item.checked}
                      disabled={isSubmitting}
                      onClick={() => toggleShoppingItem(item.ingredientId, !item.checked)}
                      className="week-shopping-item"
                    >
                      <span className="week-shopping-check" aria-hidden="true">
                        {item.checked && <Check size={18} />}
                      </span>
                      <img
                        src={getIngredientImage(item.ingredientId, item.name)}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                      />
                      <span className="week-shopping-item-copy">
                        <strong>{item.name}</strong>
                        <span>
                          {item.recommendedPurchaseQuantity} {item.unit} · dùng cho{' '}
                          {item.sourceRecipes.length} món
                        </span>
                        {item.cannotBuy && (
                          <span className="week-muted">Kế hoạch ghi nhận chưa thể mua đủ.</span>
                        )}
                      </span>
                      <span className="week-shopping-price">
                        ~{weekCurrency(item.estimatedPriceMin)} –{' '}
                        {weekCurrency(item.estimatedPriceMax)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="week-note week-shopping-confirm">
                <p>
                  {shoppingMode === 'list'
                    ? 'Bạn có thể đánh dấu khi chuẩn bị danh sách hoặc trong lúc đi chợ.'
                    : `Xác nhận nhập ${checkedItems.length} nguyên liệu đã chọn. Các nguyên liệu chưa chọn sẽ không được nhập.`}
                </p>
                <div className="week-actions">
                  {shoppingMode === 'list' ? (
                    <button
                      type="button"
                      className="week-button"
                      onClick={() => setShoppingMode('active')}
                    >
                      Bắt đầu đi chợ
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="week-button"
                      disabled={isSubmitting || !checkedItems.length}
                      aria-busy={isSubmitting}
                      onClick={finishShopping}
                    >
                      {isSubmitting
                        ? 'Đang gửi yêu cầu nhập…'
                        : `Nhập ${checkedItems.length} nguyên liệu đã chọn vào tủ`}
                    </button>
                  )}
                  {shoppingMode === 'active' && (
                    <button
                      type="button"
                      className="week-button week-button-secondary"
                      disabled={isSubmitting}
                      onClick={() => setShoppingMode('list')}
                    >
                      Về danh sách
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </WeekWorkspace>
  );
}
