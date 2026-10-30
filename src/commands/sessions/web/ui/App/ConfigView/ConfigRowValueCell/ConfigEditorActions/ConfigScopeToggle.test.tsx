// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ConfigScopeToggle } from "./ConfigScopeToggle";
import type { ConfigScope } from "../saveConfigValue";

afterEach(cleanup);

const renderToggle = (
	scopesWithValue: ConfigScope[],
	writableScopes?: ConfigScope[],
) =>
	render(
		<ConfigScopeToggle
			scope="repo"
			disabled={false}
			writableScopes={writableScopes}
			scopesWithValue={scopesWithValue}
			repoKey="assist"
			onChange={() => undefined}
		/>,
	);

const dotState = (scope: ConfigScope) =>
	screen.getByTestId(`scope-dot-${scope}`).getAttribute("data-state");

const buttonDisabled = (name: string) =>
	(screen.getByRole("button", { name }) as HTMLButtonElement).disabled;

describe("ConfigScopeToggle", () => {
	it("shows the four scopes in precedence order", () => {
		renderToggle([]);

		expect(
			screen.getAllByRole("button").map((button) => button.textContent),
		).toEqual(["repo (git)", "repo (db)", "user (node)", "user (db)"]);
	});

	it("marks every scope unset when the value comes from the schema default", () => {
		renderToggle([]);

		expect(dotState("project")).toBe("unset");
		expect(dotState("repo")).toBe("unset");
		expect(dotState("global")).toBe("unset");
		expect(dotState("user")).toBe("unset");
	});

	it("marks the winning scope effective and the shadowed ones overridden", () => {
		renderToggle(["repo", "global"]);

		expect(dotState("project")).toBe("unset");
		expect(dotState("repo")).toBe("effective");
		expect(dotState("global")).toBe("overridden");
	});

	it("titles each unselected scope with where the value lives", () => {
		renderToggle(["repo", "global"]);

		expect(screen.getByTitle("Not set in this repo's assist.yml")).toBeTruthy();
		expect(
			screen.getByTitle(
				"Set in ~/.assist.yml (this node only) — overridden by repo (db)",
			),
		).toBeTruthy();
	});

	it("titles the selected scope with where the pending save is written", () => {
		renderToggle(["repo", "global"]);

		expect(
			screen.getByRole("button", { name: "repo (db)" }).getAttribute("title"),
		).toBe(
			"This save will be written to repos.assist in the shared db (all nodes) — currently set here, in effect",
		);
	});

	it("leaves every scope enabled when the key has no writable-scope limit", () => {
		renderToggle([]);

		expect(buttonDisabled("repo (git)")).toBe(false);
		expect(buttonDisabled("repo (db)")).toBe(false);
		expect(buttonDisabled("user (node)")).toBe(false);
		expect(buttonDisabled("user (db)")).toBe(false);
	});

	it("disables every scope but user (node) for a global-only key", () => {
		renderToggle(["global"], ["global"]);

		expect(buttonDisabled("repo (git)")).toBe(true);
		expect(buttonDisabled("repo (db)")).toBe(true);
		expect(buttonDisabled("user (node)")).toBe(false);
		expect(buttonDisabled("user (db)")).toBe(true);
	});

	it("disables only the user (db) scope for a node-only key", () => {
		renderToggle([], ["project", "repo", "global"]);

		expect(buttonDisabled("repo (git)")).toBe(false);
		expect(buttonDisabled("repo (db)")).toBe(false);
		expect(buttonDisabled("user (node)")).toBe(false);
		expect(buttonDisabled("user (db)")).toBe(true);
	});
});
