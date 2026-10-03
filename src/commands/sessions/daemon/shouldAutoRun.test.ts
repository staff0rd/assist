import { describe, expect, it } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { shouldAutoRun } from "./shouldAutoRun";

const doneDraft = {
	commandType: "assist",
	status: "done",
	autoRun: true,
	assistArgs: ["draft", "--once"],
	activity: { kind: "command", itemId: 42, startedAt: 1 },
} satisfies Partial<Session>;

describe("shouldAutoRun", () => {
	describe("when a draft session with autoRun and a created item is done", () => {
		it("runs with the created item id", () => {
			expect(shouldAutoRun(makeSession(doneDraft))).toEqual({
				run: true,
				itemId: 42,
			});
		});
	});

	describe("when a bug session with autoRun and a created item is done", () => {
		it("runs", () => {
			expect(
				shouldAutoRun(
					makeSession({ ...doneDraft, assistArgs: ["bug", "--once"] }),
				),
			).toEqual({
				run: true,
				itemId: 42,
			});
		});
	});

	describe("when a refine session with autoRun and a created item is done", () => {
		it("runs", () => {
			expect(
				shouldAutoRun(
					makeSession({ ...doneDraft, assistArgs: ["refine", "--once"] }),
				),
			).toEqual({ run: true, itemId: 42 });
		});
	});

	describe("when the session exits with a non-zero code but created an item", () => {
		it("still runs, because the item id proves the draft succeeded", () => {
			expect(shouldAutoRun(makeSession(doneDraft))).toEqual({
				run: true,
				itemId: 42,
			});
		});
	});

	describe("when autoRun is off", () => {
		it("does not run and reports no reason", () => {
			expect(
				shouldAutoRun(makeSession({ ...doneDraft, autoRun: false })),
			).toEqual({
				run: false,
				reason: null,
			});
		});
	});

	describe("when no item was created", () => {
		it("does not run and reports the missing item id", () => {
			const result = shouldAutoRun(
				makeSession({ ...doneDraft, activity: undefined }),
			);
			expect(result.run).toBe(false);
			expect(result).toMatchObject({ run: false });
			if (!result.run) expect(result.reason).toContain("no itemId");
		});
	});

	describe("when the session is a next session", () => {
		it("does not run and reports the wrong command", () => {
			const result = shouldAutoRun(
				makeSession({ ...doneDraft, assistArgs: ["next", "--once"] }),
			);
			expect(result.run).toBe(false);
			if (!result.run) expect(result.reason).toContain("next");
		});
	});

	describe("when the session is not yet done", () => {
		it("does not run and reports the status", () => {
			const result = shouldAutoRun(
				makeSession({ ...doneDraft, status: "running" }),
			);
			expect(result.run).toBe(false);
			if (!result.run) expect(result.reason).toContain("running");
		});
	});

	describe("when the session is not an assist session", () => {
		it("does not run and reports the command type", () => {
			const result = shouldAutoRun(
				makeSession({ ...doneDraft, commandType: "run" }),
			);
			expect(result.run).toBe(false);
			if (!result.run) expect(result.reason).toContain("run");
		});
	});
});
