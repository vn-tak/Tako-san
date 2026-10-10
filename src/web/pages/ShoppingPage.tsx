import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { KitchenHeader, KitchenPageHeading } from '../components/common/KitchenHeader';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { InlineError } from '../components/common/AsyncState';
import { shoppingApi, type ShoppingInput, type ShoppingItem } from '../services/shopping';
import { ApiError, createClientItemId } from '../services/http';
import { queryKeys } from '../lib/queryKeys';
import { parseShoppingForm, SHOPPING_UNITS, shoppingQuantity } from '../lib/shopping-form';

export const ShoppingPage: React.FC = () => {
  const client = useQueryClient();
  const shoppingKey = queryKeys.shoppingList();
  // A separate key keeps the source envelope out of existing array consumers.
  const snapshotKey = [...shoppingKey, 'snapshot'];
  const query = useQuery({
    queryKey: snapshotKey,
    queryFn: shoppingApi.getShoppingListSnapshot,
    retry: false,
  });
  const items = query.data?.items ?? [];
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('piece');
  const [attempt, setAttempt] = useState<ShoppingInput | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [removing, setRemoving] = useState<ShoppingItem | null>(null);
  const [receipt, setReceipt] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const refresh = () => client.invalidateQueries({ queryKey: shoppingKey });
  const accept = (result: { pendingSync?: boolean }) => {
    setReceipt(
      result.pendingSync
        ? 'Đã lưu trên thiết bị, đang chờ đồng bộ. Máy chủ có thể chưa nhận thay đổi.'
        : 'Máy chủ đã nhận thay đổi.',
    );
    return refresh();
  };
  const add = useMutation({
    mutationFn: shoppingApi.addShoppingItem,
    onError: (failure) => {
      if (failure instanceof ApiError && failure.status === 400) setAttempt(null);
    },
    onSuccess: (result) => {
      setName('');
      setQuantity('1');
      setAttempt(null);
      return accept(result);
    },
  });
  const toggle = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      shoppingApi.toggleShoppingItem(id, checked),
    onSuccess: accept,
  });
  const remove = useMutation({ mutationFn: shoppingApi.deleteShoppingItem, onSuccess: accept });
  const busy = add.isPending || toggle.isPending || remove.isPending;
  const mutationError = add.error ?? toggle.error ?? remove.error;
  useEffect(() => {
    if (invalid || mutationError) {
      errorRef.current?.focus();
      errorRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [invalid, mutationError]);
  useEffect(() => {
    if (!name.trim() && !attempt) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [name, attempt]);
  function clearErrors() {
    add.reset();
    toggle.reset();
    remove.reset();
    setReceipt('');
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const parsed = attempt ?? parseShoppingForm(name, quantity, unit);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    clearErrors();
    const input = attempt ?? { ...parsed, id: createClientItemId('shop') };
    setAttempt(input);
    add.mutate(input);
  }
  const remaining = items.filter((item) => !item.isChecked);
  const checked = items.filter((item) => item.isChecked);
  return (
    <div className="shopping-workspace">
      <KitchenHeader backTo="/" />
      <div className="planning-page-body">
        <KitchenPageHeading
          eyebrow="TAKOSAN · ĐI CHỢ"
          title="Mua đủ cho bữa ngon."
          description="Danh sách của gia đình. Ghi món cần mua, đánh dấu khi đã có."
          action={
            <Link to="/planner" className="planning-text-link">
              Xem thực đơn <ArrowRight size={18} aria-hidden="true" />
            </Link>
          }
        />
        <div className="saved-shopping-layout">
          <aside className="shopping-add-panel planning-paper">
            <p className="planning-eyebrow">THÊM VÀO DANH SÁCH</p>
            <h2>Mình cần mua gì?</h2>
            <form onSubmit={submit} className="shopping-add-form">
              <fieldset disabled={busy || !!attempt}>
                <label>
                  Tên nguyên liệu
                  <input
                    ref={nameRef}
                    name="shopping-name"
                    autoComplete="off"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: nấm, hành tím…"
                  />
                </label>
                <div className="shopping-amount-fields">
                  <label>
                    Số lượng
                    <input
                      name="shopping-quantity"
                      autoComplete="off"
                      type="number"
                      inputMode="decimal"
                      min={Number.MIN_VALUE}
                      step="any"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </label>
                  <label>
                    Đơn vị
                    <select
                      name="shopping-unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      {SHOPPING_UNITS.map((entry) => (
                        <option key={entry.value} value={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </fieldset>
              {attempt && !busy && (
                <p className="planning-note">
                  Thử lại đúng món và số lượng vừa gửi để tránh thêm trùng. Bản nháp này chưa được
                  giữ khi tải lại trang.
                </p>
              )}
              <Button
                type="submit"
                fullWidth
                isLoading={add.isPending}
                disabled={busy && !add.isPending}
              >
                <Plus size={18} aria-hidden="true" className="mr-2" />
                {attempt ? 'Thử lại món vừa gửi' : 'Thêm vào danh sách'}
              </Button>
            </form>
            <p className="planning-note">
              Đánh dấu đã mua chỉ cập nhật danh sách. Thêm thực phẩm vào tủ lạnh qua bước quét hoặc
              nhập riêng.
            </p>
            <Link to="/scan" className="planning-text-link">
              Quét thực phẩm đã mua <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
          <section className="shopping-saved-list" aria-labelledby="saved-list-heading">
            <div className="shopping-list-heading">
              <div>
                <p className="planning-eyebrow">DANH SÁCH ĐÃ LƯU</p>
                <h2 id="saved-list-heading">
                  Cần mua <span>{remaining.length}</span>
                </h2>
              </div>
              <p>{checked.length} đã đánh dấu</p>
            </div>
            {query.data?.source === 'device' && (
              <p role="status" className="planning-notice">
                Đang xem danh sách trên thiết bị. Đây chưa phải xác nhận dữ liệu mới nhất từ máy
                chủ.
              </p>
            )}
            {(invalid || mutationError) && (
              <div ref={errorRef} tabIndex={-1} className="planning-error-focus">
                {invalid ? (
                  <p role="alert">Nhập tên, số lượng lớn hơn 0 và chọn đơn vị.</p>
                ) : (
                  <InlineError message="Chưa xác nhận được thay đổi. Hãy thử lại thao tác vừa gửi." />
                )}
              </div>
            )}
            <p role="status" className="planning-receipt">
              {receipt}
            </p>
            {query.isError ? (
              <InlineError error={query.error} onRetry={() => void query.refetch()} />
            ) : query.isPending ? (
              <p role="status" className="planning-paper">
                Đang tải danh sách đi chợ…
              </p>
            ) : items.length === 0 ? (
              <div className="shopping-empty planning-paper">
                <ShoppingBag size={36} aria-hidden="true" />
                <h3>Danh sách đang trống</h3>
                <p>Thêm nguyên liệu cần mua hoặc chọn phần thiếu từ một công thức.</p>
                <Link to="/recipes" className="planning-text-link">
                  Tìm món cho bữa tới <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <>
                <ul className="shopping-item-list">
                  {[...remaining, ...checked].map((item) => (
                    <li
                      key={item.id}
                      className={`shopping-saved-row ${item.isChecked ? 'is-checked' : ''}`}
                    >
                      <label className="shopping-check-label">
                        <input
                          type="checkbox"
                          checked={item.isChecked}
                          disabled={busy}
                          onChange={(e) => {
                            clearErrors();
                            toggle.mutate({ id: item.id, checked: e.target.checked });
                          }}
                        />
                        <span>
                          <strong>{item.name}</strong>
                          <span className="shopping-row-quantity">
                            {shoppingQuantity(item.quantity, item.unit)}
                          </span>
                          {item.sourceRecipeTitle && (
                            <span className="planning-note">
                              Từ công thức: {item.sourceRecipeTitle}
                            </span>
                          )}
                          {item.pendingSync && (
                            <span className="shopping-pending-label">Chờ đồng bộ</span>
                          )}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="planning-icon-button"
                        disabled={busy}
                        onClick={() => setRemoving(item)}
                        aria-label={`Xóa khỏi danh sách: ${item.name}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
      <ConfirmDialog
        open={!!removing}
        title="Xóa khỏi danh sách?"
        description={
          removing ? `Xóa “${removing.name}” khỏi danh sách mua sắm của gia đình.` : undefined
        }
        confirmText="Xóa món"
        cancelText="Giữ lại"
        destructive
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const item = removing;
          setRemoving(null);
          if (item && !busy) {
            clearErrors();
            remove.mutate(item.id);
          }
        }}
      />
    </div>
  );
};
