import type { ReactNode } from 'react';
import { KitchenHeader, KitchenPageHeading } from './KitchenHeader';

export function KitchenDetailPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="stock-detail-page">
      <KitchenHeader backTo="/fridge" backLabel="Về tủ lạnh" />
      <div className="stock-detail-workspace">
        <KitchenPageHeading title={title} eyebrow="Tủ của bạn" description={description} />
        <div className="stock-detail-body">{children}</div>
      </div>
    </div>
  );
}
