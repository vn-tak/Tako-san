import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/common/Button';
import { TAKOSAN_KITCHEN } from '../lib/takosan-kitchen';
import { ArrowRight, Camera, ClipboardCheck, CookingPot } from 'lucide-react';

const STEPS = [
  { title: 'Ghi lại đồ ăn đang có', description: 'Chụp ảnh nguyên liệu hoặc hóa đơn để bắt đầu.', icon: Camera },
  { title: 'Kiểm tra trước khi thêm', description: 'Bạn xem lại tên, lượng và hạn dùng trước khi lưu vào tủ.', icon: ClipboardCheck },
  { title: 'Chọn bữa ăn phù hợp', description: 'Xem món có thể nấu và nguyên liệu cần mua thêm.', icon: CookingPot },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const setGuestSession = useAuthStore((s) => s.setGuestSession);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const startGuest = async (path: string) => {
    setGuestError(null);
    setIsStarting(true);
    try { await setGuestSession(); navigate(path); }
    catch (error) { setGuestError(error instanceof Error ? error.message : 'Không thể khởi tạo phiên khách. Vui lòng thử lại.'); }
    finally { setIsStarting(false); }
  };

  return (
    <main data-testid="landing-page" className="takosan-rebuild entry-page landing-page">
      <header className="entry-brand-header">
        <img src={TAKOSAN_KITCHEN.logo} alt="Takosan" translate="no" width={300} height={72} data-testid="landing-logo" />
        <span>Bếp nhà, bớt lo.</span>
      </header>
      <div className="landing-intro">
        <p className="kitchen-eyebrow">Từ đồ ăn trong tủ đến bữa cơm trên bàn</p>
        <h1>Ăn đủ.<br />Mua đủ.<br /><span>Dùng hết.</span></h1>
        <p className="landing-description">Bớt quên đồ trong tủ. Bớt băn khoăn hôm nay ăn gì. Takosan giúp bạn nhìn rõ nguyên liệu đang có và chuẩn bị bữa ăn tiếp theo.</p>
      </div>
      <div className="landing-actions">
        {guestError && <p role="alert" className="text-semantic-danger-strong">{guestError}</p>}
        <Button fullWidth size="lg" onClick={() => startGuest('/onboarding')} isLoading={isStarting}>
          Dùng thử Takosan ngay <ArrowRight size={20} aria-hidden="true" />
        </Button>
        <Button fullWidth size="lg" variant="outline" onClick={() => navigate('/auth')} disabled={isStarting}>
          Đăng nhập hoặc tạo tài khoản
        </Button>
        <p>Dùng thử không cần tạo tài khoản. Đăng nhập để đồng bộ giữa các thiết bị.</p>
      </div>
      <section className="landing-flow" aria-label="Cách Takosan giúp bạn">
        <h2>Bắt đầu từ chính căn bếp của bạn.</h2>
        <ol>
          {STEPS.map(({ title, description, icon: Icon }, index) => (
            <li key={title}>
              <span className="landing-step-number" aria-hidden="true">0{index + 1}</span>
              <Icon size={24} aria-hidden="true" />
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>
          ))}
        </ol>
        <p className="landing-scan-note">AI hỗ trợ nhận diện; bạn quyết định thông tin được lưu. Kết quả có thể cần sửa.</p>
      </section>
      <footer className="entry-footer">Một căn bếp ngăn nắp hơn, từng bữa một.</footer>
    </main>
  );
};
