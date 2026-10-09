import type { StandardUnit } from '@frigo/domain';

export const REVIEW_UNITS: ReadonlyArray<{ value: StandardUnit; label: string }> = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'piece', label: 'Cái / quả' },
  { value: 'pack', label: 'Gói' },
  { value: 'bunch', label: 'Bó' },
  { value: 'slice', label: 'Lát' },
];

export interface ReviewValues {
  rawName: string;
  estimatedQuantity: number | '';
  unit: StandardUnit;
  storage: 'fridge' | 'freezer' | 'pantry';
  expiryDate?: string;
  expiryEstimated?: boolean;
}

export function validReviewQuantity(quantity: number | '') {
  return (
    typeof quantity === 'number' && Number.isFinite(quantity) && quantity > 0 && quantity <= 10000
  );
}

export function validReviewExpiry(date?: string) {
  if (!date) return true;
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date;
}

export function validReviewValues(item: ReviewValues) {
  return (
    Boolean(item.rawName.trim()) &&
    validReviewQuantity(item.estimatedQuantity) &&
    validReviewExpiry(item.expiryDate)
  );
}

export function ReviewFields({
  prefix,
  item,
  disabled,
  onChange,
  receipt = false,
}: {
  prefix: string;
  item: ReviewValues;
  disabled: boolean;
  onChange: (changes: Partial<ReviewValues>) => void;
  receipt?: boolean;
}) {
  const fieldId = (field: string) =>
    receipt ? `receipt-${field}-${prefix.slice(8)}` : `${prefix}-${field}`;
  return (
    <fieldset disabled={disabled} className="review-fields">
      <legend className="sr-only">Thông tin bạn xác nhận</legend>
      <label className="review-field-wide" htmlFor={`${fieldId('name')}`}>
        {receipt ? 'Tên sản phẩm' : 'Tên nguyên liệu'}
        <input
          id={`${fieldId('name')}`}
          aria-label={receipt ? 'Tên sản phẩm' : 'Tên nguyên liệu'}
          className="review-input"
          value={item.rawName}
          required
          pattern=".*\S.*"
          disabled={disabled}
          aria-invalid={!disabled && !item.rawName.trim()}
          onChange={(event) => onChange({ rawName: event.target.value })}
        />
      </label>
      <label htmlFor={`${fieldId('quantity')}`}>
        Số lượng
        <input
          id={`${fieldId('quantity')}`}
          aria-label={'Số lượng'}
          className="review-input"
          type="number"
          inputMode="decimal"
          min={Number.MIN_VALUE}
          max="10000"
          step="any"
          required
          value={item.estimatedQuantity}
          disabled={disabled}
          aria-invalid={!disabled && !validReviewQuantity(item.estimatedQuantity)}
          onChange={(event) =>
            onChange({
              estimatedQuantity: event.target.value === '' ? '' : Number(event.target.value),
            })
          }
        />
      </label>
      <label htmlFor={`${fieldId('unit')}`}>
        Đơn vị
        <select
          id={`${fieldId('unit')}`}
          aria-label={'Đơn vị'}
          className="review-input"
          value={item.unit}
          disabled={disabled}
          onChange={(event) => onChange({ unit: event.target.value as StandardUnit })}
        >
          {REVIEW_UNITS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${fieldId('storage')}`}>
        {receipt ? 'Nơi bảo quản' : 'Bảo quản'}
        <select
          id={`${fieldId('storage')}`}
          aria-label={receipt ? 'Nơi bảo quản' : 'Bảo quản'}
          className="review-input"
          value={item.storage}
          disabled={disabled}
          onChange={(event) => onChange({ storage: event.target.value as ReviewValues['storage'] })}
        >
          <option value="fridge">Ngăn mát</option>
          <option value="freezer">Ngăn đông</option>
          <option value="pantry">Kệ bếp</option>
        </select>
      </label>
      <label htmlFor={`${fieldId('expiry')}`}>
        {receipt ? 'Hạn dùng trên nhãn' : 'Hạn dùng'}
        <input
          id={`${fieldId('expiry')}`}
          aria-label={receipt ? 'Hạn dùng trên nhãn' : 'Hạn dùng'}
          className="review-input"
          type="date"
          value={item.expiryDate ?? ''}
          disabled={disabled}
          aria-invalid={!disabled && !validReviewExpiry(item.expiryDate)}
          onChange={(event) =>
            onChange({ expiryDate: event.target.value || undefined, expiryEstimated: false })
          }
        />
      </label>
      {!disabled && !validReviewValues(item) && (
        <p className="review-field-wide review-field-error" role="alert">
          Cần có tên, số lượng lớn hơn 0 (tối đa 10.000) và ngày hợp lệ.
        </p>
      )}
    </fieldset>
  );
}
