// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import { highLevelTreeFixture } from "../highLevelTreeFixture";
import { HighLevelAllFiles } from "./HighLevelAllFiles";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const PATHS = ["src/lib/util.ts", "src/app.ts", "README.md"];
const SUBJECT = "org/repo#1";

function payload(collapsedPaths: string[] = []): HighLevelPreviewPayload {
	return {
		repo: "org/repo",
		prNumber: 1,
		headSha: "abc",
		body: "",
		checks: [],
		structure: {
			tree: highLevelTreeFixture,
			added: 0,
			removed: 0,
			modified: 3,
			additions: 3,
			deletions: 3,
		},
		criticalDiffs: [],
		criticalPaths: [],
		tests: [],
		testPaths: [],
		collapsedPaths,
		slices: [],
		manualTesting: { setup: [], steps: [] },
	};
}

function renderAllFiles(collapsedPaths: string[] = []) {
	return render(
		<HighLevelAllFiles payload={payload(collapsedPaths)} subject={SUBJECT} />,
	);
}

function fileRow(path: string) {
	return screen.getByRole("button", {
		name: new RegExp(`^(Expand|Collapse) ${path}$`),
	});
}

function expanded(name: string) {
	return screen.getByRole("button", { name }).getAttribute("aria-expanded");
}

function diffCount(container: HTMLElement) {
	return container.querySelectorAll("table.diff").length;
}

describe("HighLevelAllFiles", () => {
	it("starts every file's diff collapsed with directories open", () => {
		const { container } = renderAllFiles();

		for (const path of PATHS)
			expect(fileRow(path).getAttribute("aria-expanded")).toBe("false");
		expect(diffCount(container)).toBe(0);
		expect(expanded("src")).toBe("true");
		expect(expanded("src/lib")).toBe("true");
	});

	it("keeps the collapsedPaths chip on glob-matched files", () => {
		renderAllFiles(["**/*.md"]);

		expect(
			screen.getByTitle("Collapsed by review.highLevel.collapsedPaths")
				.textContent,
		).toBe("ignored**/*.md");
	});

	it("remembers an expanded file across remounts", () => {
		const first = renderAllFiles();
		fireEvent.click(fileRow("README.md"));
		first.unmount();

		const { container } = renderAllFiles();

		expect(fileRow("README.md").getAttribute("aria-expanded")).toBe("true");
		expect(diffCount(container)).toBe(1);
	});

	it("resets back to every file collapsed", () => {
		const { container } = renderAllFiles();
		fireEvent.click(screen.getByRole("button", { name: /^Expand all/ }));
		expect(diffCount(container)).toBe(3);

		fireEvent.click(screen.getByRole("button", { name: "Reset 3 changes" }));

		expect(diffCount(container)).toBe(0);
	});

	it("ignores toggles saved under the PR's pre-existing subject", () => {
		localStorage.setItem(
			`assist:high-level-tree:files:${SUBJECT}`,
			JSON.stringify({ savedAt: Date.now(), items: ["README.md"] }),
		);

		const { container } = renderAllFiles();

		expect(fileRow("README.md").getAttribute("aria-expanded")).toBe("false");
		expect(diffCount(container)).toBe(0);
	});
});
