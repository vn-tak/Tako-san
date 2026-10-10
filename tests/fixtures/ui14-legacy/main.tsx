import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { MotionConfigContext } from 'motion/react';
import { useContext } from 'react';
import { BottomNavigationBar, RailSidebar } from '../../../src/web/design-system/navigation';
import { MotionProvider } from '../../../src/web/design-system/motion-provider';
import '../../../src/web/styles/index.css';

function Fixture() {
  const location = useLocation();
  const config = useContext(MotionConfigContext);
  return (
    <>
      <RailSidebar />
      <main className="sm:pl-20 lg:pl-64 p-6">
        <h1>UI14 isolated legacy navigation fixture</h1>
        <output aria-live="polite" data-fixture-path>
          {location.pathname}
        </output>
        <p data-fixture-policy>{config.reducedMotion}</p>
      </main>
      <BottomNavigationBar />
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={['/recipes']}>
      <MotionProvider>
        <Fixture />
      </MotionProvider>
    </MemoryRouter>
  </React.StrictMode>,
);
