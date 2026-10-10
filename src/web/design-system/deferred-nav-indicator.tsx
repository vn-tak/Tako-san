import React, { useEffect, useState } from 'react';

type Indicator = React.ComponentType<{ indicatorId: string }>;
let indicatorRequest: Promise<Indicator> | undefined;

function loadIndicator() {
  return (indicatorRequest ??= import('./legacy-nav-indicator').then(
    (module) => module.LegacyNavIndicator,
  ));
}

export const DeferredNavIndicator: React.FC<{ indicatorId: string }> = ({ indicatorId }) => {
  const [Indicator, setIndicator] = useState<Indicator | null>(null);
  useEffect(() => {
    let current = true;
    void loadIndicator().then(
      (component) => {
        if (current) setIndicator(() => component);
      },
      () => {
        /* Optional motion cannot interrupt navigation; keep the static highlight. */
      },
    );
    return () => {
      current = false;
    };
  }, []);
  return Indicator ? (
    <Indicator indicatorId={indicatorId} />
  ) : (
    <span aria-hidden="true" className="absolute inset-0 rounded-card bg-semantic-success-soft" />
  );
};
