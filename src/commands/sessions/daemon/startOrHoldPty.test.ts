import { describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { startOrHoldPty } from "./startOrHoldPty";

const { pty } = makePty();

describe("startOrHoldPty", () => {
	it("starts the process immediately when nothing has to be seeded first", () => {
		const start = vi.fn(() => pty);

		const result = startOrHoldPty(start, false);

		expect(start).toHaveBeenCalled();
		expect(result.pty).toBe(pty);
		expect(result.pendingStart).toBeUndefined();
	});

	it("holds the process without starting it when the tree is still seeding", () => {
		const start = vi.fn(() => pty);

		const result = startOrHoldPty(start, true);

		expect(start).not.toHaveBeenCalled();
		expect(result.pty).toBeNull();
		expect(result.pendingStart).toBe(start);
	});

	it("marks a held start that will run driven", () => {
		const result = startOrHoldPty(
			() => pty,
			true,
			() => true,
		);

		expect(result.drivenStart).toBe(true);
	});

	it("does not decide drivenness for a start that runs immediately", () => {
		const driven = vi.fn(() => true);

		const result = startOrHoldPty(() => pty, false, driven);

		expect(driven).not.toHaveBeenCalled();
		expect(result.drivenStart).toBeUndefined();
	});
});
