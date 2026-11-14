// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { RuleScope } from "../../../../../rules/types";
import { RuleScopeNav } from "./RuleScopeNav";
import { scopeInEffect } from "./scopeInEffect";

afterEach(cleanup);

const scopes: RuleScope[] = [
	{ id: "user-db", kind: "user-db", name: "User (db)", depth: 0, rules: [] },
	{ id: "repo-db", kind: "repo-db", name: "Repo (db)", depth: 0, rules: [] },
	{
		id: "claude-md:",
		kind: "claude-md",
		name: "CLAUDE.md",
		dir: "",
		depth: 0,
		rules: [],
	},
	{
		id: "claude-md:docs/",
		kind: "claude-md",
		name: "docs/CLAUDE.md",
		dir: "docs/",
		depth: 1,
		rules: [],
	},
];

function renderNav(path: string) {
	render(
		<RuleScopeNav
			scopes={scopes}
			selectedId="user-db"
			onSelect={() => {}}
			isInEffect={(scope) => scopeInEffect(scope, path)}
		/>,
	);
}

function scopeButton(name: string) {
	const button = screen.getByText(name).closest<HTMLElement>("[role=button]");
	if (!button) throw new Error(`No scope button for ${name}`);
	return button;
}

describe("RuleScopeNav", () => {
	it("dims only the scopes that do not reach the path", () => {
		renderNav("src/index.ts");

		const dimmed = scopeButton("docs/CLAUDE.md");
		expect(dimmed.dataset.inEffect).toBe("false");
		expect(dimmed.title).toBe("Not in effect for this path");
		for (const name of ["User (db)", "Repo (db)", "CLAUDE.md"]) {
			expect(scopeButton(name).dataset.inEffect).toBe("true");
		}
	});

	it("keeps every scope in effect for a path under the nested directory", () => {
		renderNav("docs/guide.md");

		expect(scopeButton("docs/CLAUDE.md").dataset.inEffect).toBe("true");
		expect(scopeButton("docs/CLAUDE.md").title).toBe("");
	});
});
