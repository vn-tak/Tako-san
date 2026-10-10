/** Scoped digital direction; the supplied kit remains available to legacy callers. */
const BASE = '/takosan/rebuild';
export const TAKOSAN_KITCHEN = {
  name: 'Takosan',
  motto: 'Ăn đủ. Mua đủ. Dùng hết.',
  logo: `${BASE}/lockup.svg`,
  symbol: `${BASE}/symbol.svg`,
  symbolMicro: `${BASE}/symbol-micro.svg`,
  wordmark: `${BASE}/wordmark.svg`,
  stacked: `${BASE}/stacked.svg`,
  reverse: `${BASE}/lockup-reverse.svg`,
  mono: `${BASE}/lockup-mono.svg`,
  monoReverse: `${BASE}/lockup-mono-reverse.svg`,
  og: `${BASE}/og.png`,
  appIcons: {
    favicon: `${BASE}/app-icons/favicon.svg`,
    icon180: `${BASE}/app-icons/icon-180.png`,
    icon192: `${BASE}/app-icons/icon-192.png`,
    icon512: `${BASE}/app-icons/icon-512.png`,
    maskable512: `${BASE}/app-icons/icon-maskable-512.png`,
  },
  colors: { coral: '#EE705E', pine: '#245D49', ink: '#202C28', canvas: '#F7F3EC' },
} as const;
