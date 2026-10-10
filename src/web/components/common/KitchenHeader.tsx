import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { TAKOSAN_KITCHEN } from '../../lib/takosan-kitchen';

export function KitchenHeader({
  backTo,
  backLabel = 'Quay lại',
}: {
  backTo?: string;
  backLabel?: string;
}) {
  const { avatarUrl } = useAuthStore();
  return (
    <header className="kitchen-header">
      <div className="flex min-w-0 items-center gap-2">
        {backTo && (
          <Link to={backTo} aria-label={backLabel} className="kitchen-icon-link">
            <ArrowLeft aria-hidden="true" size={20} />
          </Link>
        )}
        <Link to="/" aria-label="Takosan — Trang chủ" translate="no" className="kitchen-brand-link">
          <img src={TAKOSAN_KITCHEN.logo} alt="" width={300} height={72} />
        </Link>
        <span className="kitchen-brand-motto" aria-hidden="true">{TAKOSAN_KITCHEN.motto}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link to="/notifications" aria-label="Thông báo" className="kitchen-icon-link">
          <Bell aria-hidden="true" size={20} />
        </Link>
        <Link to="/me" aria-label="Tài khoản cá nhân" className="kitchen-icon-link">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <User aria-hidden="true" size={20} />
          )}
        </Link>
      </div>
    </header>
  );
}

export function KitchenPageHeading({
  title,
  eyebrow,
  description,
  action,
}: {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="kitchen-page-heading">
      <div className="min-w-0">
        {eyebrow && <p className="kitchen-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && (
          <div className="mt-2 text-sm text-semantic-text-secondary">{description}</div>
        )}
      </div>
      {action}
    </div>
  );
}
