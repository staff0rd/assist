import { describe, expect, it } from "vitest";
import { parseRestartNudge } from "../shared/parseRestartNudge";
import { pendingQuestionPrompt } from "./pendingQuestionPrompt";

describe("pendingQuestionPrompt", () => {
	it("tags a nudge with no killed tasks as killed 0", () => {
		const prompt = pendingQuestionPrompt([]);
		expect(parseRestartNudge(prompt)).toBe(0);
		expect(prompt).toContain("AskUserQuestion");
	});

	it("tags the nudge with the killed task count", () => {
		expect(parseRestartNudge(pendingQuestionPrompt(["b1"]))).toBe(1);
	});
});
