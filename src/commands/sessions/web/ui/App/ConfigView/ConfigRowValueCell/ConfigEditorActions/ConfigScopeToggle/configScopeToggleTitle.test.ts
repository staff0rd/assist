import { describe, expect, it } from "vitest";
import { configScopeToggleTitle } from "./configScopeToggleTitle";
import type { ConfigScope } from "../../saveConfigValue";

const title = (
	scope: ConfigScope,
	scopesWithValue: ConfigScope[],
	writableScopes?: ConfigScope[],
) =>
	configScopeToggleTitle({
		scope,
		scopesWithValue,
		repoKey: "assist",
		writableScopes,
		selected: false,
	});

const selectedTitle = (
	scope: ConfigScope,
	scopesWithValue: ConfigScope[],
	writableScopes?: ConfigScope[],
) =>
	configScopeToggleTitle({
		scope,
		scopesWithValue,
		repoKey: "assist",
		writableScopes,
		selected: true,
	});

describe("configScopeToggleTitle", () => {
	it("names the file a scope is not set in", () => {
		expect(title("project", [])).toBe("Not set in this repo's assist.yml");
		expect(title("repo", [])).toBe(
			"Not set in repos.assist in the shared db (all nodes)",
		);
		expect(title("global", [])).toBe(
			"Not set in ~/.assist.yml (this node only)",
		);
		expect(title("user", [])).toBe(
			"Not set in the shared db (every repo, all nodes)",
		);
	});

	it("marks the highest-precedence scope as in effect", () => {
		expect(title("repo", ["repo", "global"])).toBe(
			"Set in repos.assist in the shared db (all nodes) — in effect",
		);
	});

	it("names the scope overriding a lower one", () => {
		expect(title("global", ["project", "repo", "global"])).toBe(
			"Set in ~/.assist.yml (this node only) — overridden by repo (git)",
		);
		expect(title("global", ["repo", "global"])).toBe(
			"Set in ~/.assist.yml (this node only) — overridden by repo (db)",
		);
		expect(title("user", ["global", "user"])).toBe(
			"Set in the shared db (every repo, all nodes) — overridden by user (node)",
		);
	});

	it("explains why other scopes are disabled for a global-only key", () => {
		const globalOnly: ConfigScope[] = ["global"];
		expect(title("project", ["global"], globalOnly)).toBe(
			"Node-only key: only user (node) can hold it",
		);
		expect(title("user", ["global"], globalOnly)).toBe(
			"Node-only key: only user (node) can hold it",
		);
		expect(title("global", ["global"], globalOnly)).toBe(
			"Set in ~/.assist.yml (this node only) — in effect",
		);
	});

	it("explains why the user db is disabled for a node-only key", () => {
		const nodeOnly: ConfigScope[] = ["project", "repo", "global"];
		expect(title("user", [], nodeOnly)).toBe(
			"Node-only key: it can't be stored in user (db)",
		);
		expect(title("repo", [], nodeOnly)).toBe(
			"Not set in repos.assist in the shared db (all nodes)",
		);
	});

	it("lists the writable scopes for a db-only key", () => {
		expect(title("global", [], ["user"])).toBe(
			"Only user (db) can hold this key",
		);
	});

	it("falls back to a generic repos description without a repo key", () => {
		expect(
			configScopeToggleTitle({
				scope: "repo",
				scopesWithValue: [],
				repoKey: undefined,
				selected: false,
			}),
		).toBe("Not set in this repo's override in the shared db (all nodes)");
	});

	it("names the file the pending save will be written to", () => {
		expect(selectedTitle("repo", ["repo"])).toBe(
			"This save will be written to repos.assist in the shared db (all nodes) — currently set here, in effect",
		);
		expect(selectedTitle("project", ["repo"])).toBe(
			"This save will be written to this repo's assist.yml — not currently set here",
		);
		expect(selectedTitle("global", ["repo", "global"])).toBe(
			"This save will be written to ~/.assist.yml (this node only) — currently set here, overridden by repo (db)",
		);
	});

	it("keeps the lock explanation for a selected disabled scope", () => {
		expect(selectedTitle("project", ["global"], ["global"])).toBe(
			"Node-only key: only user (node) can hold it",
		);
	});
});
