import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAutoExit } from "./createAutoExit";

describe("createAutoExit", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("exits once the grace period elapses while idle", () => {
		const exit = vi.fn();
		const check = createAutoExit(exit, 1_000);

		check(true);
		vi.advanceTimersByTime(999);
		expect(exit).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(exit).toHaveBeenCalledOnce();
	});

	it("cancels the exit when activity resumes", () => {
		const exit = vi.fn();
		const check = createAutoExit(exit, 1_000);

		check(true);
		vi.advanceTimersByTime(500);
		check(false);
		vi.advanceTimersByTime(10_000);

		expect(exit).not.toHaveBeenCalled();
	});

	it("does not restart the grace period on repeated idle signals", () => {
		const exit = vi.fn();
		const check = createAutoExit(exit, 1_000);

		check(true);
		vi.advanceTimersByTime(500);
		check(true);
		vi.advanceTimersByTime(500);

		expect(exit).toHaveBeenCalledOnce();
	});

	it("re-arms after an activity reset", () => {
		const exit = vi.fn();
		const check = createAutoExit(exit, 1_000);

		check(true);
		check(false);
		check(true);
		vi.advanceTimersByTime(1_000);

		expect(exit).toHaveBeenCalledOnce();
	});
});
