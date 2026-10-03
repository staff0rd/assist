import { describe, expect, it } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { shouldAutoDismiss } from "./shouldAutoDismiss";

describe("shouldAutoDismiss", () => {
	describe("when a draft --once session exits cleanly", () => {
		it("dismisses", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["draft", "--once"],
			});

			expect(shouldAutoDismiss(session, 0)).toBe(true);
		});
	});

	describe("when a bug --once session exits cleanly", () => {
		it("dismisses", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["bug", "--once"],
			});

			expect(shouldAutoDismiss(session, 0)).toBe(true);
		});
	});

	describe("when a next --once session exits cleanly", () => {
		it("keeps", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["next", "--once"],
			});

			expect(shouldAutoDismiss(session, 0)).toBe(false);
		});
	});

	describe("when a --once session exits with a non-zero code", () => {
		it("keeps", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["bug", "--once"],
			});

			expect(shouldAutoDismiss(session, 1)).toBe(false);
		});
	});

	describe("when an update session exits cleanly", () => {
		it("dismisses", () => {
			const session = makeSession({ status: "done", assistArgs: ["update"] });

			expect(shouldAutoDismiss(session, 0)).toBe(true);
		});
	});

	describe("when an update session exits with a non-zero code", () => {
		it("keeps", () => {
			const session = makeSession({ status: "done", assistArgs: ["update"] });

			expect(shouldAutoDismiss(session, 1)).toBe(false);
		});
	});

	describe("when a non --once session exits cleanly", () => {
		it("keeps", () => {
			const session = makeSession({ status: "done", assistArgs: ["bug"] });

			expect(shouldAutoDismiss(session, 0)).toBe(false);
		});
	});

	describe("when the session has no assistArgs", () => {
		it("keeps", () => {
			const session = makeSession({ status: "done", assistArgs: undefined });

			expect(shouldAutoDismiss(session, 0)).toBe(false);
		});
	});

	describe("when a --once session is not yet done", () => {
		it("keeps", () => {
			const session = makeSession({
				status: "running",
				assistArgs: ["bug", "--once"],
			});

			expect(shouldAutoDismiss(session, 0)).toBe(false);
		});
	});

	describe("when a backlog run reached review and Continue is on", () => {
		it("dismisses", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["backlog"],
				reviewStarted: true,
				autoAdvance: true,
			});

			expect(shouldAutoDismiss(session, 0)).toBe(true);
		});
	});

	describe("when a backlog run reached review and Continue is off", () => {
		it("keeps", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["backlog"],
				reviewStarted: true,
				autoAdvance: false,
			});

			expect(shouldAutoDismiss(session, 0)).toBe(false);
		});
	});

	describe("when a backlog run has not reached review", () => {
		it("keeps", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["backlog"],
				autoAdvance: true,
			});

			expect(shouldAutoDismiss(session, 0)).toBe(false);
		});
	});

	describe("when a non-backlog session has autoAdvance on but never reached review", () => {
		it("keeps", () => {
			const session = makeSession({
				status: "done",
				assistArgs: ["bug"],
				autoAdvance: true,
			});

			expect(shouldAutoDismiss(session, 0)).toBe(false);
		});
	});
});
