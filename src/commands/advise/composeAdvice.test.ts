import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { mergeRawConfigs } from "../../shared/mergeDenyRules";
import { assistConfigSchema } from "../../shared/types";
import type { AdviceContext } from "./AdviceContext";
import { adviceConditions } from "./adviceConditions";
import { composeAdvice } from "./composeAdvice";
import { loadAdviceFragments } from "./loadAdviceFragments";
import { selectAdvice } from "./selectAdvice";

const fragments = loadAdviceFragments();

function contextWith(
	raw: Record<string, unknown>,
	assistSession = false,
): AdviceContext {
	return {
		config: assistConfigSchema.parse(raw),
		rootDir: "/repo",
		assistSession,
	};
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
	"fixing-commands",
	"link-urls",
	"markdown",
	"show-links",
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

	it("adds the ask fragment only in an assist-launched session", () => {
		expect(includedNames(contextWith({}))).not.toContain("ask");
		expect(includedNames(contextWith({}, true))).toContain("ask");
	});

	it("adds ask-question and ask-check only when sessions.askQuestion is on in an assist session", () => {
		const askQuestionOn = { sessions: { askQuestion: true } };

		expect(
			includedNames(contextWith({ sessions: { askQuestion: false } }, true)),
		).not.toContain("ask-question");
		expect(includedNames(contextWith({}, true))).toEqual(
			expect.arrayContaining(["ask-check", "ask-question"]),
		);
		expect(includedNames(contextWith(askQuestionOn))).not.toContain(
			"ask-question",
		);
		expect(includedNames(contextWith(askQuestionOn))).not.toContain(
			"ask-check",
		);
		expect(includedNames(contextWith(askQuestionOn, true))).toEqual(
			expect.arrayContaining(["ask", "ask-check", "ask-question"]),
		);
	});

	it("states the ask rules unconditionally in an assist session", () => {
		const markdown = composeAdvice(
			contextWith({ sessions: { askQuestion: true } }, true),
			fragments,
		);

		expect(markdown).toContain("## Asking for a manual check");
		expect(markdown).toContain("assist ask-check --json -");
		expect(markdown).toContain(
			"keep waiting on the pending `ask-check`; don't re-run, supersede or stop it",
		);
		expect(markdown).toContain("assist ask-question --json -");
		expect(markdown).toContain("assist ask --title");
		expect(markdown).not.toContain("ASSIST_SESSION");
		for (const name of ["ask", "ask-check", "ask-question"]) {
			const fragment = fragments.find((entry) => entry.name === name);
			expect(fragment?.body).not.toMatch(
				/(outside|in) an? (assist|web) session/i,
			);
		}
	});

	it("omits every ask rule outside an assist session", () => {
		const markdown = composeAdvice(
			contextWith({ sessions: { askQuestion: true } }),
			fragments,
		);

		expect(markdown).not.toContain("assist ask");
		expect(markdown).not.toContain("ASSIST_SESSION");
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
			"Fixing command and skill misbehaviour",
			"Fetching Jira context",
			"Editing Jira issues with Smart Links",
			"Linking to web pages and settings",
			"Writing markdown",
			"Showing long links, paths and snippets",
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
			assistSession: false,
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

	it("emits no rules section when advice.rules is empty", () => {
		expect(composeAdvice(contextWith({}), fragments)).not.toContain(
			"## Your rules",
		);
		expect(
			composeAdvice(contextWith({ advice: { rules: [] } }), fragments),
		).not.toContain("## Your rules");
	});

	it("lists global advice.rules as their own section", () => {
		const markdown = composeAdvice(
			contextWith({
				advice: { rules: [{ title: "Links", text: "Give URLs." }] },
			}),
			[],
		);

		expect(markdown).toContain("## Your rules\n\n- **Links** — Give URLs.");
	});

	it("lists global rules before repo rules once configs are merged", () => {
		const merged = mergeRawConfigs(
			{ advice: { rules: [{ title: "Links", text: "Give URLs." }] } },
			{ advice: { rules: [{ title: "Deploy", text: "Main only." }] } },
		);
		const markdown = composeAdvice(contextWith(merged), []);

		expect(markdown).toContain(
			"## Your rules\n\n- **Links** — Give URLs.\n- **Deploy** — Main only.",
		);
	});

	it("returns nothing when no fragment applies", () => {
		expect(composeAdvice(contextWith({}), [])).toBe("");
	});
});
