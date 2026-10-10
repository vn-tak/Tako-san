import type { ReactNode } from 'react';
import { KitchenHeader, KitchenPageHeading } from './KitchenHeader';

export function AccountPage({
  title,
  description,
  children,
  backTo = '/me',
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  backTo?: string | null;
}) {
  return (
    <div className="account-page">
      <KitchenHeader backTo={backTo ?? undefined} />
      <div className="account-workspace">
        <KitchenPageHeading title={title} eyebrow="Bếp của bạn" description={description} />
        <div className="account-body">{children}</div>
      </div>
    </div>
  );
}
