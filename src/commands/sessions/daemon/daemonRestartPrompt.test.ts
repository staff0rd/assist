import { describe, expect, it } from "vitest";
import { parseRestartNudge } from "../shared/parseRestartNudge";
import { daemonRestartPrompt } from "./daemonRestartPrompt";

describe("daemonRestartPrompt", () => {
	it("tags a nudge with no killed tasks as killed 0", () => {
		const prompt = daemonRestartPrompt([]);
		expect(parseRestartNudge(prompt)).toBe(0);
		expect(prompt).toContain("Continue from where you left off.");
	});

	it("tags the nudge with the killed task count and names the tasks", () => {
		const prompt = daemonRestartPrompt(["b1", "b2"]);
		expect(parseRestartNudge(prompt)).toBe(2);
		expect(prompt).toContain("(b1, b2)");
	});
});
