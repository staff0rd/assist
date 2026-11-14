import { describe, expect, it } from "vitest";
import { summariseToolRun } from "./summariseToolRun";

describe("summariseToolRun", () => {
	it("counts calls per tool in first-seen order", () => {
		const calls = ["Bash", "Read", "Bash", "Bash", "Bash", "Bash"].map(
			(tool) => ({ tool }),
		);
		expect(summariseToolRun(calls)).toBe("6 tool calls · Bash ×5, Read");
	});

	it("uses the singular for one call", () => {
		expect(summariseToolRun([{ tool: "Grep" }])).toBe("1 tool call · Grep");
	});
});
