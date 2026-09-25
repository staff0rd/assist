// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ConfigScopeToggle } from "./ConfigScopeToggle";
import type { ConfigScope } from "../saveConfigValue";

afterEach(cleanup);

const renderToggle = (scopesWithValue: ConfigScope[], lockedToGlobal = false) =>
	render(
		<ConfigScopeToggle
			scope="repo"
			disabled={false}
			lockedToGlobal={lockedToGlobal}
			scopesWithValue={scopesWithValue}
			repoKey="assist"
			onChange={() => undefined}
		/>,
	);

const dotState = (scope: ConfigScope) =>
	screen.getByTestId(`scope-dot-${scope}`).getAttribute("data-state");

describe("ConfigScopeToggle", () => {
	it("marks every scope unset when the value comes from the schema default", () => {
		renderToggle([]);

		expect(dotState("project")).toBe("unset");
		expect(dotState("repo")).toBe("unset");
		expect(dotState("global")).toBe("unset");
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
			screen.getByTitle("Set in ~/.assist.yml — overridden by This repo"),
		).toBeTruthy();
	});

	it("titles the selected scope with where the pending save is written", () => {
		renderToggle(["repo", "global"]);

		expect(
			screen.getByRole("button", { name: "This repo" }).getAttribute("title"),
		).toBe(
			"This save will be written to repos.assist in ~/.assist.yml — currently set here, in effect",
		);
	});

	it("disables the project and repo scopes for a global-only key", () => {
		renderToggle(["global"], true);

		expect(screen.getByText("Project").closest("button")?.disabled).toBe(true);
		expect(screen.getByText("This repo").closest("button")?.disabled).toBe(
			true,
		);
		expect(screen.getByText("Global").closest("button")?.disabled).toBe(false);
	});
});
