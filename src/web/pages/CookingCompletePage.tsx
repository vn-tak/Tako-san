import React from 'react';
import { Link } from 'react-router-dom';
import { useCookingStore } from '../stores/useCookingStore';
import { CookingReview } from '../components/cooking/CookingReview';

export const CookingCompletePage: React.FC = () => {
  const runId = useCookingStore((state) => state.runId);
  return runId ? (
    <CookingReview key={runId} />
  ) : (
    <div className="cooking-empty">
      <span className="cooking-eyebrow">Tako-san · Bếp nhà</span>
      <h1>Không có món ăn đang hoàn tất</h1>
      <p>Chọn công thức và bắt đầu nấu để kiểm tra lượng nguyên liệu thực dùng.</p>
      <Link className="cooking-primary" to="/recipes">
        Xem công thức
      </Link>
    </div>
  );
};
