import { describe, expect, it } from "vitest";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";
import { buildReviewPrompt } from "./buildReviewPrompt";

describe("buildReviewPrompt", () => {
	describe("commitBeforePhaseEnd", () => {
		it("leaves the prompt unchanged when the flag is off", () => {
			const prompt = buildReviewPrompt(makeBacklogItem(), 3, {
				commitBeforePhaseEnd: false,
			});

			expect(prompt).toBe(buildReviewPrompt(makeBacklogItem(), 3));
			expect(prompt).not.toContain(
				"Before asking the user to confirm manual checks, run /commit",
			);
		});

		it("instructs the agent to commit before the manual check confirmation when the flag is on", () => {
			const prompt = buildReviewPrompt(makeBacklogItem(), 3, {
				commitBeforePhaseEnd: true,
			});

			expect(prompt).toContain(
				"Before asking the user to confirm manual checks, run /commit to commit the work (it is fine if there is nothing new to commit).",
			);
			expect(prompt.indexOf("run /commit to commit the work")).toBeLessThan(
				prompt.indexOf(
					"After all criteria pass, ask the user to confirm any manual checks",
				),
			);
		});

		it("keeps the post-confirmation commit step when the flag is on", () => {
			const prompt = buildReviewPrompt(makeBacklogItem(), 3, {
				commitBeforePhaseEnd: true,
			});

			expect(prompt).toContain("1. Run: /commit");
			expect(
				prompt.indexOf(
					"After all criteria pass, ask the user to confirm any manual checks",
				),
			).toBeLessThan(prompt.indexOf("1. Run: /commit"));
		});
	});
});
