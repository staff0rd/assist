import { describe, expect, it } from "vitest";
import { buildStepPrompt } from "./buildStepPrompt";

const manualTesting = {
	setup: ["Seed a user"],
	steps: [
		{ action: "Open the dashboard", expect: "A chart shows" },
		{ action: "Click Export", expect: "A CSV downloads" },
	],
};

describe("buildStepPrompt", () => {
	it("gives the URL, setup, earlier verdicts and the current step", () => {
		const prompt = buildStepPrompt("http://localhost:6000/", manualTesting, 1, [
			{
				step: 1,
				action: "Open the dashboard",
				expect: "A chart shows",
				verdict: "pass",
				note: "Chart rendered",
				screenshot: "/r/step-01.png",
			},
		]);
		expect(prompt).toContain("running at http://localhost:6000/");
		expect(prompt).toContain("- Seed a user");
		expect(prompt).toContain("1. Open the dashboard → pass: Chart rendered");
		expect(prompt).toContain(
			"Step 2 of 2:\nAction: Click Export\nExpect: A CSV downloads",
		);
		expect(prompt).toContain("record_verdict");
	});
});
