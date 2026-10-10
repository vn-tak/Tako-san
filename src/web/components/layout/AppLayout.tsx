import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigationBar, RailSidebar } from '../../design-system/navigation';
import { OfflineBanner } from '../common/OfflineBanner';
import { TAKOSAN_KITCHEN } from '../../lib/takosan-kitchen';

// Review routes keep navigation; only the scan camera and full-screen workflows hide it.
const IMMERSIVE_PATTERNS = [
  /^\/scan\/?$/,
  /^\/cook(\/.*)?$/,
  /^\/cooking(\/.*)?$/,
  /^\/auth(\/.*)?$/,
  /^\/onboarding(\/.*)?$/,
];

/** Scope the prototype shell to migrated screens; other routes retain the current kit. */
export function isKitchenSurface(pathname: string) {
  return (
    pathname === '/' ||
    /^\/(fridge|inventory)\/?$/.test(pathname) ||
    /^\/scan(?:\/|$)/.test(pathname) ||
    /^\/recipes(?:\/|$)/.test(pathname) ||
    /^\/(cook|cooking)(?:\/|$)/.test(pathname)
  );
}

export const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  const immersive = IMMERSIVE_PATTERNS.some((re) => re.test(pathname));
  const kitchen = isKitchenSurface(pathname);
  return (
    <div
      className={`${kitchen ? 'takosan-rebuild ' : ''}min-h-dvh bg-semantic-background text-semantic-text-primary antialiased selection:bg-takosan-mint`}
    >
      {kitchen && (
        <a href="#kitchen-main" className="kitchen-skip-link">
          Đến nội dung chính
        </a>
      )}
      {!immersive && (
        <RailSidebar
          brandLogo={kitchen ? TAKOSAN_KITCHEN.logo : undefined}
          brandSymbol={kitchen ? TAKOSAN_KITCHEN.symbol : undefined}
        />
      )}
      {/* The shell owns rail/sidebar offsets and the maximum content width. */}
      <div className={immersive ? '' : 'sm:pl-20 lg:pl-64'}>
        {!immersive && <OfflineBanner />}
        <main
          id={kitchen ? 'kitchen-main' : undefined}
          tabIndex={kitchen ? -1 : undefined}
          className={
            immersive
              ? ''
              : 'min-h-dvh pb-[calc(68px+env(safe-area-inset-bottom,0px))] sm:pb-0 mx-auto w-full max-w-[var(--content-wide)]'
          }
        >
          <Outlet />
        </main>
        {!immersive && <BottomNavigationBar />}
      </div>
    </div>
  );
};
