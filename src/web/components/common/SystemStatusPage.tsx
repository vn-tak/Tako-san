import type { ReactNode } from 'react';
import { TAKOSAN_KITCHEN } from '../../lib/takosan-kitchen';

export function SystemStatusPage({
  title,
  children,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  busy?: boolean;
}) {
  return (
    <main className="takosan-rebuild system-status-page" aria-busy={busy}>
      <div className="system-status-workspace">
        <img src={TAKOSAN_KITCHEN.logo} alt="Takosan" translate="no" width={300} height={72} />
        <section className="system-status-content">
          <p className="system-status-eyebrow">Bếp của bạn</p>
          <h1>{title}</h1>
          {children}
        </section>
      </div>
    </main>
  );
}
