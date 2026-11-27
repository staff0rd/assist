import { describe, expect, it } from "vitest";
import { buildReviewCompletionLines } from "./buildReviewCompletionLines";

describe("buildReviewCompletionLines", () => {
	it("waits for an explicit completion instruction outside yolo", () => {
		const text = buildReviewCompletionLines("a12", 3).join("\n");

		expect(text).toBe(
			buildReviewCompletionLines("a12", 3, [], false).join("\n"),
		);
		expect(text).toContain(
			"Once the user gives that explicit completion instruction:",
		);
		expect(text).not.toContain("yolo");
	});

	it("treats yolo mode as the completion instruction", () => {
		const text = buildReviewCompletionLines("a12", 3, [], true).join("\n");

		expect(text).toContain("yolo mode is the completion instruction");
		expect(text).toContain(
			"Once every acceptance criterion passes and /commit has run, run the completion steps below straight away.",
		);
		expect(text).toContain("1. Run: /commit");
		expect(text).toContain('2. Run: assist backlog done a12 "<summary>"');
		expect(text).toContain('3. Run: assist backlog phase-done a12 3 "done"');
		expect(text).not.toContain("explicit completion instruction");
	});

	it("falls back to waiting for the user when a criterion cannot pass under yolo", () => {
		const text = buildReviewCompletionLines("a12", 3, [], true).join("\n");

		expect(text).toContain(
			"If a criterion cannot be made to pass, do not run the completion steps",
		);
	});

	it("keeps rewind confirm-first under yolo", () => {
		const text = buildReviewCompletionLines("a12", 3, [], true).join("\n");

		expect(text).toContain("Rewinding is a confirm-first exception");
		expect(text).toContain("assist backlog rewind a12 <phase>");
	});
});
