import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ReviewHeading({
  receipt = false,
  confirmed = false,
}: {
  receipt?: boolean;
  confirmed?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header className="review-heading">
      <button
        type="button"
        className="kitchen-icon-link"
        aria-label="Quay lại màn quét"
        onClick={() => navigate('/scan')}
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </button>
      <div>
        <p className="kitchen-eyebrow">
          {confirmed ? 'Bản quét đã xác nhận · Chỉ xem' : 'Thêm vào tủ · Bước 2 / 3'}
        </p>
        <h1>{receipt ? 'Kiểm tra hóa đơn' : 'Kiểm tra nguyên liệu'}</h1>
        <p>
          {confirmed ? 'Xem lại thông tin đã xác nhận.' : 'Xem lại thông tin trước khi xác nhận.'}
        </p>
      </div>
    </header>
  );
}

export function ReviewSummary({
  total,
  accepted,
  confirmed,
}: {
  total: number;
  accepted: number;
  confirmed: boolean;
}) {
  return (
    <div className="review-summary" aria-label="Tóm tắt bản quét">
      <p className="kitchen-eyebrow">
        {confirmed ? 'Bản quét đã xác nhận' : 'Danh sách chờ bạn kiểm tra'}
      </p>
      <p className="review-summary-count">
        {accepted}
        <span>
          {' '}
          / {total} dòng {confirmed ? 'đã nhận' : 'sẽ nhận'}
        </span>
      </p>
      <p>
        {total - accepted > 0 ? `${total - accepted} dòng bỏ qua. ` : ''}
        {confirmed
          ? 'Sửa lô đã lưu trong tủ lạnh nếu cần.'
          : 'Chỉ những dòng được nhận mới thêm vào tủ khi bạn xác nhận.'}
      </p>
      {!confirmed && (
        <p className="review-summary-note">
          AI có thể đọc nhầm. Kiểm tra tên, lượng và đơn vị; chỉ nhập ngày trên nhãn khi bạn biết
          rõ.
        </p>
      )}
    </div>
  );
}
