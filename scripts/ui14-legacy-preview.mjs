import { build, preview } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const repo = resolve('.');
const baseline = process.env.UI14_LEGACY_BASELINE === 'true';
const port = baseline ? 5219 : 5218;
const revision = 'f3a09f2a7beb548fbd4bc9ef8ae932a092dd3827';
const config = {
  configFile: false,
  root: resolve(repo, 'tests/fixtures/ui14-legacy'),
  publicDir: resolve(repo, 'public'),
  plugins: [
    ...(baseline
      ? [
          {
            name: 'ui14-pinned-legacy-baseline',
            enforce: 'pre',
            load(id) {
              if (id === resolve(repo, 'src/web/design-system/navigation.tsx'))
                return execFileSync(
                  'git',
                  ['show', `${revision}:src/web/design-system/navigation.tsx`],
                  { cwd: repo, encoding: 'utf8' },
                );
              if (id === resolve(repo, 'src/web/design-system/motion-provider.tsx'))
                return execFileSync(
                  'git',
                  ['show', `${revision}:src/web/design-system/motion.tsx`],
                  { cwd: repo, encoding: 'utf8' },
                );
            },
          },
        ]
      : []),
    react(),
  ],
  define: { 'import.meta.env.VITE_MEAL_PLANNER_ENABLED': JSON.stringify('false') },
  build: {
    outDir: resolve(repo, `.artifacts/ui14/legacy-${baseline ? 'baseline-' : ''}build`),
    sourcemap: true,
    emptyOutDir: false,
  },
};
await build(config);
const server = await preview({
  ...config,
  preview: { host: '127.0.0.1', port, strictPort: true },
});
console.log(
  `UI14 isolated actual legacy components; baseline=${baseline}; no application payment/auth route: http://127.0.0.1:${port}`,
);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.httpServer.close());
