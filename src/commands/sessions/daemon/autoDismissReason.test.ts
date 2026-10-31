import { describe, expect, it } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { autoDismissReason } from "./autoDismissReason";

describe("autoDismissReason", () => {
	describe("when a backlog run reached review", () => {
		it("does not mention Continue", () => {
			const session = makeSession({ reviewStarted: true, autoAdvance: false });

			expect(autoDismissReason(session)).toBe("backlog run reached review");
		});
	});

	describe("when a backlog run paused with Continue off", () => {
		it("says so", () => {
			const session = makeSession({
				activity: { kind: "backlog", itemId: 7, startedAt: 1 },
				autoAdvance: false,
			});

			expect(autoDismissReason(session)).toBe(
				"backlog run paused with Continue off",
			);
		});
	});

	describe("when an assist command exited", () => {
		it("names the command", () => {
			const session = makeSession({ assistArgs: ["bug", "--once"] });

			expect(autoDismissReason(session)).toBe(
				"assist bug --once exited cleanly",
			);
		});
	});
});
