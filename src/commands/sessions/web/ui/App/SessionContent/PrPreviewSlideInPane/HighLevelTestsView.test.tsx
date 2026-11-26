// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { HighLevelTestFile } from "../../../../../../review/highLevel/types";
import { describeHeaderClicks } from "./describeHeaderClicks";
import { HighLevelTestsView } from "./HighLevelTestsView";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function testFile(path: string): HighLevelTestFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://github.com/o/r/pull/1/files#${path}`,
		tests: [{ kind: "it", id: `${path}:1`, name: "works", line: 1 }],
	};
}

describeHeaderClicks("HighLevelTestsView", () => {
	render(
		<HighLevelTestsView
			files={[testFile("a.graphql"), testFile("b.graphql")]}
			testPaths={["**/*.graphql"]}
			subject="tests-header-clicks"
		/>,
	);
});

describe("HighLevelTestsView regrouping", () => {
	const file = testFile("a.test.ts");
	const regrouping = {
		"a.test.ts": [
			{
				describe: "when ready",
				children: [{ id: "a.test.ts:1", it: "passes" }],
			},
		],
	};
	const view = (withRegrouping: boolean) =>
		render(
			<HighLevelTestsView
				files={[file]}
				testPaths={[]}
				subject="tests-regrouping"
				{...(withRegrouping ? { regrouping } : {})}
			/>,
		);

	it("opens on the By when view with the written name on hover", () => {
		view(true);
		expect(screen.getByText("ready", { exact: false })).toBeTruthy();
		expect(screen.getByTitle("As written: works").textContent).toBe(
			"it passes",
		);
	});

	it("leads the opened source with the written name and line", () => {
		view(true);
		fireEvent.click(
			screen.getByRole("button", { name: "Show the source of works" }),
		);
		expect(screen.getByText("As written:", { exact: false }).textContent).toBe(
			"As written: works · line 1",
		);
	});

	it("switches to the tests as written and remembers it", () => {
		view(true);
		fireEvent.click(screen.getByRole("button", { name: "As written" }));
		expect(screen.getByTitle("works").textContent).toBe("works");
		cleanup();
		view(true);
		expect(screen.queryByText("passes", { exact: false })).toBeNull();
	});

	it("shows no toggle without a regrouping", () => {
		view(false);
		expect(screen.queryByRole("button", { name: "By when" })).toBeNull();
	});
});
