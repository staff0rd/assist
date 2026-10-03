import { vi } from "vitest";

export function mockFunctions<T extends object>(actual: T): T {
	const mocked: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(actual)) {
		mocked[key] = typeof value === "function" ? vi.fn() : value;
	}
	mocked.default = mocked;
	return mocked as T;
}
