import { describe, expect, it } from "vitest";
import { sessionType } from "./sessionType";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";

describe("sessionType", () => {
	it("derives the assist command as the type", () => {
		for (const cmd of [
			"draft",
			"bug",
			"next",
			"refine",
			"review",
			"update",
		] as const) {
			const session = makeSessionInfo({
				commandType: "assist",
				assistArgs: [cmd, "--once"],
			});
			expect(sessionType(session)).toBe(cmd);
		}
	});

	it("maps review-pr-comments to the review type", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["review-pr-comments", "123"],
		});
		expect(sessionType(session)).toBe("review");
	});

	it("maps fix-conflict to the review type", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["fix-conflict", "123"],
		});
		expect(sessionType(session)).toBe("review");
	});

	it("treats a free claude session as a prompt", () => {
		expect(sessionType(makeSessionInfo({ commandType: "claude" }))).toBe(
			"prompt",
		);
	});

	it("treats an unrecognised assist command as a prompt", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["something-else"],
		});
		expect(sessionType(session)).toBe("prompt");
	});

	it("switches to 'next' once a backlog activity is present", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			assistArgs: ["draft", "--once"],
			activity: { kind: "backlog", itemId: 1, startedAt: 0 },
		});
		expect(sessionType(session)).toBe("next");
	});

	it("uses 'run' for run sessions", () => {
		expect(
			sessionType(makeSessionInfo({ commandType: "run", runName: "build" })),
		).toBe("run");
	});
});
