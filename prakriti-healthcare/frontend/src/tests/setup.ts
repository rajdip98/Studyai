import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Components under test (ProductCard -> AuthProvider/CartProvider) make a
// real `fetch` call on mount to check the current session. jsdom's `fetch`
// rejects on our relative "/api/..." URLs anyway (no base URL), but doing it
// via the real network stack made that rejection resolve on a later tick
// than React Testing Library's `render()`, causing "not wrapped in act()"
// warnings. Stubbing it out lets that rejection settle deterministically.
globalThis.fetch = vi.fn().mockRejectedValue(new Error("fetch is disabled in tests"));
