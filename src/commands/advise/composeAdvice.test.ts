import { describe, expect, it } from "vitest";
import { assistConfigSchema } from "../../shared/types";
import { adviceConditions } from "./adviceConditions";
import { composeAdvice } from "./composeAdvice";
import { loadAdviceFragments } from "./loadAdviceFragments";
import { selectAdvice } from "./selectAdvice";

const fragments = loadAdviceFragments();

function contextWith(raw: Record<string, unknown>) {
	return { config: assistConfigSchema.parse(raw), rootDir: "/repo" };
}

const alwaysNames = [
	"assist-global",
	"backlog-ids",
	"backlog-prs",
	"code-comments",
	"drafting-messages",
	"editing-files",
	"markdown",
];

describe("composeAdvice", () => {
	it("ships fragments that all name a known condition", () => {
		const unknown = fragments.filter(
			(fragment) => !adviceConditions[fragment.when],
		);

		expect(unknown.map((fragment) => fragment.name)).toEqual([]);
	});

	it("includes every always-on fragment with no config at all", () => {
		const included = selectAdvice(fragments, contextWith({}))
			.filter((decision) => decision.included)
			.map((decision) => decision.fragment.name);

		expect(included).toEqual(alwaysNames);
	});

	it("adds the jira fragments only when jira is configured", () => {
		const without = composeAdvice(contextWith({}), fragments);
		const withJira = composeAdvice(contextWith({ jira: {} }), fragments);

		expect(without).not.toContain("Atlassian MCP");
		expect(without).not.toContain("inlineCard");
		expect(withJira).toContain("Atlassian MCP");
		expect(withJira).toContain("inlineCard");
		expect(withJira.length).toBeGreaterThan(without.length);
	});

	it("renders each included fragment under its title, in filename order", () => {
		const markdown = composeAdvice(contextWith({ jira: {} }), fragments);
		const titles = [...markdown.matchAll(/^## (.+)$/gm)].map(
			(match) => match[1],
		);

		expect(markdown.startsWith("# Instructions for this repo")).toBe(true);
		expect(titles).toEqual([
			"Using assist",
			"Backlog item IDs",
			"Backlog items, PRs, and commits",
			"Commenting code",
			"Drafting messages to send on the user's behalf",
			"Editing files",
			"Fetching Jira context",
			"Editing Jira issues with Smart Links",
			"Writing markdown",
		]);
	});

	it("returns nothing when no fragment applies", () => {
		expect(composeAdvice(contextWith({}), [])).toBe("");
	});
});
