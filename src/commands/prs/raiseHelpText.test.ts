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

	it("instructs asking the user for a GitHub issue when promptGithub is true", () => {
		const help = raiseHelpText(false, true);
		expect(help).toContain("--resolves <ref>");
		expect(help).toContain(
			"ask the user whether this PR\n                    resolves a GitHub issue",
		);
		expect(help).toContain("owner/repo#123");
		expect(help).not.toContain("resolves a Jira issue");
	});

	it("asks whether the PR resolves a Jira or a GitHub issue when both prompts are true", () => {
		const help = raiseHelpText(true, true);
		expect(help).toContain("--resolves <ref>");
		expect(help).toContain(
			"ask the user whether this PR resolves a Jira or a\n                    GitHub issue",
		);
	});

	it("omits the prompt instruction but keeps --resolves documented when both prompts are false", () => {
		const help = raiseHelpText(false, false);
		expect(help).toContain("--resolves <key>");
		expect(help).toContain("Jira issue key resolved by this PR");
		expect(help).not.toContain("ask the user whether this PR");
		expect(help).not.toContain("GitHub issue");
	});

	it("states that raises are drafts when prs.draft is true", () => {
		const help = raiseHelpText(false, false, true);
		expect(help).toContain("prs.draft set");
		expect(help).toContain("--no-draft is passed");
	});

	it("states that raises are ready for review when prs.draft is false", () => {
		const help = raiseHelpText(false, false, false);
		expect(help).toContain("prs.draft off");
		expect(help).toContain("--draft is passed");
	});

	it("demands a terse register, not just a sentence count", () => {
		const help = raiseHelpText(false);
		expect(help).toContain("Terse technical register");
		expect(help).toContain("Sentence count is a floor on brevity");
	});

	it("states that the budget applies to the whole body", () => {
		const help = raiseHelpText(false);
		expect(help).toContain(
			"The budget is a total, not a per-paragraph allowance",
		);
		expect(help).toContain(
			"long-winded overall is wrong even\nwhen each paragraph is individually short",
		);
	});
});
