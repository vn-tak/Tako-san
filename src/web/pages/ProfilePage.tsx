import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { AccountPage } from '../components/common/AccountPage';
import { LogoutDialog } from '../components/common/LogoutDialog';
import { Sparkles, ChevronRight, Users, Heart, Bell, Globe, Sliders, PackageCheck, LogOut } from 'lucide-react';

const GROUPS = [
  {
    title: 'Bữa ăn & gia đình',
    items: [
      { label: 'Sở thích & hạn chế', icon: Heart, path: '/me/preferences', meta: 'Gu món, độ cay và nguyên liệu cần tránh' },
      { label: 'Hộ gia đình & chia sẻ', icon: Users, path: '/me/household', meta: 'Hộ hiện tại và khả năng chia sẻ' },
      { label: 'Cài đặt lập thực đơn', icon: Sliders, path: '/settings/planning', meta: 'Ngân sách, khung bữa và ưu tiên' },
    ],
  },
  {
    title: 'Ứng dụng & dữ liệu',
    items: [
      { label: 'Tùy chỉnh thông báo', icon: Bell, path: '/settings/notifications', meta: 'Lựa chọn trên thiết bị và kênh gửi' },
      { label: 'Cài đặt ứng dụng', icon: Globe, path: '/settings/app', meta: 'Cài lên màn hình chính, ngôn ngữ và bộ nhớ đệm' },
      { label: 'Quyền riêng tư & dữ liệu', icon: PackageCheck, path: '/settings/privacy', meta: 'Dữ liệu đã lưu, AI và quyền trình duyệt' },
    ],
  },
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { displayName, email, isGuest, isPlus, avatarUrl } = useAuthStore();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const initialLetter = (displayName || 'K').charAt(0).toUpperCase();

  return (
    <AccountPage title="Hồ sơ" description="Một nơi để chăm chút bữa ăn, gia đình và cách bạn dùng Takosan." backTo={null}>
      <section className="account-profile" aria-label="Tài khoản hiện tại">
        <div className="account-identity">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" width={64} height={64} className="account-avatar" />
          ) : (
            <span className="account-avatar" aria-hidden="true">{initialLetter}</span>
          )}
          <div className="min-w-0">
            <p className="account-kicker">{isGuest ? 'Phiên dùng thử' : 'Tài khoản của bạn'}</p>
            <h2>{displayName || 'Khách'}</h2>
            <p className="account-email">{email || 'Chưa liên kết email'}</p>
          </div>
        </div>
        <Link
          to={isGuest ? '/auth?mode=login&returnTo=%2Fplus' : '/plus'}
          className="shrink-0 min-h-11 px-3 py-1.5 rounded-xl bg-takosan-yellow text-takosan-navy font-heading font-bold text-xs shadow-xs hover:brightness-105 active:scale-95 transition-[filter,transform,box-shadow] flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-warning focus-visible:ring-offset-2"
        >
          <Sparkles aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
          <span>{isGuest ? 'Đăng nhập để nâng cấp' : isPlus ? 'VIP Plus' : 'Nâng cấp'}</span>
        </Link>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} className="account-nav-group" aria-label={group.title}>
          <h2>{group.title}</h2>
          <div className="account-link-list">
            {group.items.map(({ label, icon: Icon, path, meta }) => (
              <Link key={path} to={path} className="account-nav-link">
                <span className="account-icon" aria-hidden="true"><Icon size={20} /></span>
                <span className="min-w-0"><strong>{label}</strong><span className="account-link-meta">{meta}</span></span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ))}
      <div className="account-signout">
        <button type="button" onClick={() => setConfirmLogout(true)}>
          <LogOut size={18} aria-hidden="true" /> Đăng xuất khỏi tài khoản
        </button>
        <p>Takosan · Ăn đủ. Mua đủ. Dùng hết.</p>
      </div>
      <LogoutDialog open={confirmLogout} onCancel={() => setConfirmLogout(false)} onLoggedOut={() => navigate('/auth', { replace: true })} />
    </AccountPage>
  );
};
