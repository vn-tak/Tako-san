# UI14 - Optional motion delivery

ADR-057 documents the decision before runtime changes. App.tsx changes only the
MotionProvider import; exact provider name/ancestry/routes/guards remain intact.
MotionConfig reducedMotion="user" is moved to its own module; existing helpers
re-export the provider for compatibility and retain exact helper source.

Legacy navigation replaces only its original motion.span with DeferredNavIndicator.
The loaded indicator retains layoutId, aria-hidden, classes and 0.14s transition.
One shared promise loads the optional module. Static active highlighting appears
immediately and survives import rejection; rejection is cached for the current
module lifetime, avoiding retry loops. A document reload creates a fresh module lifetime and can retry. A component
remount within the same module lifetime keeps the static fallback after rejection. Effect cleanup fences abandoned
receipts; current identity is passed after async resolution. Links stay native.

Kitchen shell keeps its static markup. The actual production entry loses the full
motion projection/drag graph and kitchen read journeys request no optional engine.
Other lazy pages may still load motion when they require it. No dependency/asset/
public/domain/auth/payment/production configuration edit.

Loopback production-build harness and isolated legacy-component fixture are tooling,
not deployed app routes. The fixture uses actual navigation/provider modules plus
MemoryRouter; baseline mode loads exact Git versions with a Vite pre-load plugin,
without modifying the application files or exercising payment/auth screens.

This round improves delivery of the existing UI07 brand. It does not introduce a
new logo, palette, mascot or photo claim. See PERFORMANCE and VERIFICATION for
measures, behavior tests, failed attempts and bounded conclusions.
