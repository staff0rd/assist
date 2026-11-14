import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withTimeout } from "./withTimeout";

describe("withTimeout", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("resolves with the work's value when it settles in time", async () => {
		await expect(withTimeout(Promise.resolve(7), 100, "work")).resolves.toBe(7);
	});

	it("rejects with the label once the work outlasts the limit", async () => {
		const timed = withTimeout(new Promise(() => {}), 100, "work");
		const settled = expect(timed).rejects.toThrow("work timed out after 100ms");
		await vi.advanceTimersByTimeAsync(100);
		await settled;
	});
});
