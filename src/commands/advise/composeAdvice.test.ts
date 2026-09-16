import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assistConfigSchema } from "../../shared/types";
import type { AdviceContext } from "./AdviceContext";
import { adviceConditions } from "./adviceConditions";
import { composeAdvice } from "./composeAdvice";
import { loadAdviceFragments } from "./loadAdviceFragments";
import { selectAdvice } from "./selectAdvice";

const fragments = loadAdviceFragments();

function contextWith(raw: Record<string, unknown>): AdviceContext {
	return { config: assistConfigSchema.parse(raw), rootDir: "/repo" };
}

function includedNames(context: AdviceContext): string[] {
	return selectAdvice(fragments, context)
		.filter((decision) => decision.included)
		.map((decision) => decision.fragment.name);
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
		expect(includedNames(contextWith({}))).toEqual(alwaysNames);
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

	it("adds the repo-fact fragments only for a repo carrying those files", () => {
		const dir = mkdtempSync(join(tmpdir(), "advice-repo-"));
		mkdirSync(join(dir, "oxlint-rules"), { recursive: true });
		mkdirSync(join(dir, "claude"), { recursive: true });
		writeFileSync(join(dir, "tsconfig.json"), "{}");
		writeFileSync(join(dir, "oxlint-rules", "filenameConvention.ts"), "");
		writeFileSync(join(dir, "claude", "settings.json"), "{}");

		const bare = includedNames(contextWith({}));
		const equipped = includedNames({
			config: assistConfigSchema.parse({}),
			rootDir: dir,
		});

		expect(bare).not.toContain("refactor");
		expect(equipped).toContain("refactor");
		expect(equipped).toContain("filename-convention");
		expect(equipped).toContain("settings-json");
	});

	it("names the repo's verify run commands in the verify fragment", () => {
		const context = contextWith({
			run: [
				{ name: "verify:lint", command: "oxlint" },
				{ name: "dev", command: "vite" },
			],
		});

		const markdown = composeAdvice(context, fragments);

		expect(includedNames(context)).toContain("verify");
		expect(markdown).toContain("`verify:lint`");
		expect(markdown).not.toContain("`dev`");
	});

	it("lets advice.verify replace the verify text and force the fragment in", () => {
		const context = contextWith({ advice: { verify: "Run `make check`." } });

		const markdown = composeAdvice(context, fragments);

		expect(includedNames(context)).toContain("verify");
		expect(markdown).toContain("Run `make check`.");
		expect(markdown).not.toContain("assist verify");
	});

	it("appends advice.extra as its own section", () => {
		const markdown = composeAdvice(
			contextWith({ advice: { extra: "Deploy from main only." } }),
			fragments,
		);

		expect(markdown).toContain("## Repo notes\n\nDeploy from main only.");
	});

	it("returns nothing when no fragment applies", () => {
		expect(composeAdvice(contextWith({}), [])).toBe("");
	});
});
