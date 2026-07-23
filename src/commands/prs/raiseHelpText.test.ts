import { describe, expect, it } from "vitest";
import { raiseHelpText } from "./raiseHelpText";

describe("raiseHelpText", () => {
	it("instructs asking the user for a Jira key when promptJira is true", () => {
		const help = raiseHelpText(true);
		expect(help).toContain("--resolves <key>");
		expect(help).toContain(
			"ask the user whether this PR\n                    resolves a Jira issue",
		);
	});

	it("omits the prompt instruction but keeps --resolves documented when promptJira is false", () => {
		const help = raiseHelpText(false);
		expect(help).toContain("--resolves <key>");
		expect(help).not.toContain("ask the user whether this PR");
	});
});
