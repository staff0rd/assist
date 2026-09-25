// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CommitRef } from "../../../../../../shared/db/listCommitRefs";
import type { DiffTotals } from "./diffFileTotals";
import { DiffToolbar } from "./DiffToolbar";
import type { DiffChangeType } from "./filterDiffFiles";
import type { DiffPanelMode } from "../toggleDiffPanel";

afterEach(cleanup);

function LocationProbe() {
	return <div data-testid="location">{useLocation().pathname}</div>;
}

const noTotals: DiffTotals = { files: 0, added: 0, removed: 0 };

function renderToolbar({
	scope = "all",
	scopeCommits = [],
	scopeBranchBase = null,
	onScopeChange = vi.fn(),
	treeVisible = true,
	onToggleTree = vi.fn(),
	commentHint,
	mode,
	onToggleMode,
	changeType = "all",
	onChangeTypeChange = vi.fn(),
	search = "",
	onSearchChange = vi.fn(),
	allCollapsed = false,
	onToggleCollapseAll = vi.fn(),
	totals = noTotals,
}: {
	scope?: string;
	scopeCommits?: CommitRef[];
	scopeBranchBase?: string | null;
	onScopeChange?: (scope: string) => void;
	treeVisible?: boolean;
	onToggleTree?: () => void;
	commentHint?: string;
	mode?: DiffPanelMode;
	onToggleMode?: () => void;
	changeType?: DiffChangeType;
	onChangeTypeChange?: (changeType: DiffChangeType) => void;
	search?: string;
	onSearchChange?: (search: string) => void;
	allCollapsed?: boolean;
	onToggleCollapseAll?: () => void;
	totals?: DiffTotals;
} = {}) {
	render(
		<MemoryRouter initialEntries={["/sessions", "/diff"]} initialIndex={1}>
			<DiffToolbar
				viewType="unified"
				onChange={vi.fn()}
				search={search}
				onSearchChange={onSearchChange}
				changeType={changeType}
				onChangeTypeChange={onChangeTypeChange}
				allCollapsed={allCollapsed}
				onToggleCollapseAll={onToggleCollapseAll}
				scope={{
					scope,
					commits: scopeCommits,
					branchBase: scopeBranchBase,
				}}
				onScopeChange={onScopeChange}
				totals={totals}
				treeVisible={treeVisible}
				onToggleTree={onToggleTree}
				commentHint={commentHint}
				mode={mode}
				onToggleMode={onToggleMode}
			/>
			<LocationProbe />
		</MemoryRouter>,
	);
}

const commits: CommitRef[] = [
	{ sha: "aaaaaaabbbbbbb", title: "feat: the first commit" },
	{ sha: "cccccccddddddd" },
];

function scopeButton(): HTMLElement {
	return screen.getByRole("button", { name: /^Diff scope/ });
}

function openScopeMenu(): HTMLElement {
	fireEvent.click(scopeButton());
	return screen.getByRole("menu");
}

function openChangeTypeMenu(): HTMLElement {
	fireEvent.click(screen.getByRole("button", { name: /change type/i }));
	return screen.getByRole("menu");
}

describe("DiffToolbar", () => {
	it("returns to the previous page when closed", async () => {
		renderToolbar();
		expect(screen.getByTestId("location").textContent).toBe("/diff");

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		await waitFor(() =>
			expect(screen.getByTestId("location").textContent).toBe("/sessions"),
		);
	});

	it("explains why commenting is unavailable", () => {
		renderToolbar({ commentHint: "no live session" });

		expect(screen.getByText("no live session")).toBeTruthy();
	});

	it("shows no hint when commenting is available", () => {
		renderToolbar();

		expect(screen.queryByText(/session/)).toBeNull();
	});

	it("offers to hide the file tree while it is showing", () => {
		const onToggleTree = vi.fn();
		renderToolbar({ treeVisible: true, onToggleTree });

		fireEvent.click(screen.getByRole("button", { name: "Hide file tree" }));

		expect(onToggleTree).toHaveBeenCalled();
	});

	it("offers to show the file tree while it is hidden", () => {
		renderToolbar({ treeVisible: false });

		expect(screen.getByRole("button", { name: "Show file tree" })).toBeTruthy();
	});

	it("puts the tree toggle left of the scope, over the column it controls", () => {
		renderToolbar();

		const tree = screen.getByRole("button", { name: "Hide file tree" });

		expect(
			tree.compareDocumentPosition(scopeButton()) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("offers both view types", () => {
		renderToolbar();

		expect(screen.getByRole("button", { name: "Unified view" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Split view" })).toBeTruthy();
	});
});

describe("DiffToolbar scope", () => {
	it("names the scope on the button rather than in a form field", () => {
		renderToolbar();

		expect(scopeButton().textContent).toBe("All changes");
		expect(screen.queryByRole("combobox")).toBeNull();
	});

	it("lists All, Uncommitted, Branch and one entry per commit", () => {
		renderToolbar({ scopeCommits: commits, scopeBranchBase: "origin/main" });

		const items = within(openScopeMenu()).getAllByRole("menuitem");

		expect(items.map((item) => item.textContent)).toEqual([
			"All changes",
			"Uncommitted",
			"Branchvs origin/main",
			"feat: the first commit",
			"ccccccc",
		]);
	});

	it("omits the Branch option when no branch base resolves", () => {
		renderToolbar({ scopeCommits: commits });

		const items = within(openScopeMenu()).getAllByRole("menuitem");

		expect(items.map((item) => item.textContent)).toEqual([
			"All changes",
			"Uncommitted",
			"feat: the first commit",
			"ccccccc",
		]);
	});

	it("shows what the branch scope is measured against", () => {
		renderToolbar({ scope: "branch", scopeBranchBase: "origin/main" });

		expect(scopeButton().textContent).toBe("Branchvs origin/main");
	});

	it("falls back to All when branch is selected without a branch base", () => {
		renderToolbar({ scope: "branch" });

		expect(scopeButton().textContent).toBe("All changes");
	});

	it("shows the selected commit by its subject", () => {
		renderToolbar({ scope: "aaaaaaabbbbbbb", scopeCommits: commits });

		expect(scopeButton().textContent).toBe("feat: the first commit");
	});

	it("falls back to All when the url names an unknown scope", () => {
		renderToolbar({ scope: "deadbeef", scopeCommits: commits });

		expect(scopeButton().textContent).toBe("All changes");
	});

	it("reports the chosen scope", () => {
		const onScopeChange = vi.fn();
		renderToolbar({ scopeCommits: commits, onScopeChange });

		fireEvent.click(
			within(openScopeMenu()).getByRole("menuitem", { name: "Uncommitted" }),
		);

		expect(onScopeChange).toHaveBeenCalledWith("uncommitted");
	});
});

describe("DiffToolbar counts", () => {
	it("summarises the files and line totals in the row", () => {
		renderToolbar({ totals: { files: 32, added: 925, removed: 172 } });

		expect(screen.getByText(/32 files/)).toBeTruthy();
		expect(screen.getByText("+925")).toBeTruthy();
		expect(screen.getByText("−172")).toBeTruthy();
	});

	it("says file in the singular", () => {
		renderToolbar({ totals: { files: 1, added: 2, removed: 0 } });

		expect(screen.getByText(/1 file(?!s)/)).toBeTruthy();
	});

	it("shows no summary for an empty diff", () => {
		renderToolbar();

		expect(screen.queryByText(/files/)).toBeNull();
	});

	it("drops the summary while a change type is filtering", () => {
		renderToolbar({
			changeType: "modified",
			totals: { files: 32, added: 925, removed: 172 },
		});

		expect(screen.queryByText(/32 files/)).toBeNull();
	});

	it("drops the summary while a file search is filtering", () => {
		renderToolbar({
			search: "Diff",
			totals: { files: 32, added: 925, removed: 172 },
		});

		expect(screen.queryByText(/32 files/)).toBeNull();
	});
});

describe("DiffToolbar change type", () => {
	it("offers every change type behind the filter button", () => {
		const items =
			(renderToolbar(), within(openChangeTypeMenu()).getAllByRole("menuitem"));

		expect(items.map((item) => item.textContent)).toEqual([
			"All files",
			"Modified",
			"Added",
			"Removed",
			"Renamed",
		]);
	});

	it("reports the chosen change type", () => {
		const onChangeTypeChange = vi.fn();
		renderToolbar({ onChangeTypeChange });

		fireEvent.click(
			within(openChangeTypeMenu()).getByRole("menuitem", { name: "Modified" }),
		);

		expect(onChangeTypeChange).toHaveBeenCalledWith("modified");
	});

	it("shows no chip while every change type is included", () => {
		renderToolbar();

		expect(screen.queryByRole("button", { name: /Clear the/ })).toBeNull();
	});

	it("shows the active change type as a chip that clears it", () => {
		const onChangeTypeChange = vi.fn();
		renderToolbar({ changeType: "removed", onChangeTypeChange });

		expect(screen.getByText("Removed")).toBeTruthy();
		fireEvent.click(
			screen.getByRole("button", { name: "Clear the Removed filter" }),
		);

		expect(onChangeTypeChange).toHaveBeenCalledWith("all");
	});
});

describe("DiffToolbar file search", () => {
	it("stays collapsed to an icon until it is opened", () => {
		renderToolbar();

		expect(screen.queryByRole("textbox")).toBeNull();
		expect(
			screen.getByRole("button", { name: "Filter files by name" }),
		).toBeTruthy();
	});

	it("expands in place when the icon is clicked", () => {
		renderToolbar();

		fireEvent.click(
			screen.getByRole("button", { name: "Filter files by name" }),
		);

		expect(screen.getByRole("textbox", { name: "Filter files" })).toBeTruthy();
	});

	it("stays expanded while a search is active", () => {
		renderToolbar({ search: "Diff" });

		expect(
			(
				screen.getByRole("textbox", {
					name: "Filter files",
				}) as HTMLInputElement
			).value,
		).toBe("Diff");
	});

	it("reports what was typed", () => {
		const onSearchChange = vi.fn();
		renderToolbar({ search: "D", onSearchChange });

		fireEvent.change(screen.getByRole("textbox", { name: "Filter files" }), {
			target: { value: "Diff" },
		});

		expect(onSearchChange).toHaveBeenCalledWith("Diff");
	});

	it("clears the search when it is dismissed", () => {
		const onSearchChange = vi.fn();
		renderToolbar({ search: "Diff", onSearchChange });

		fireEvent.click(screen.getByRole("button", { name: "Clear file filter" }));

		expect(onSearchChange).toHaveBeenCalledWith("");
	});
});

describe("DiffToolbar collapse all", () => {
	it("offers to collapse every file while any is expanded", () => {
		const onToggleCollapseAll = vi.fn();
		renderToolbar({ allCollapsed: false, onToggleCollapseAll });

		fireEvent.click(screen.getByRole("button", { name: "Collapse all files" }));

		expect(onToggleCollapseAll).toHaveBeenCalled();
	});

	it("offers to expand every file once they are all collapsed", () => {
		const onToggleCollapseAll = vi.fn();
		renderToolbar({ allCollapsed: true, onToggleCollapseAll });

		expect(
			screen.queryByRole("button", { name: "Collapse all files" }),
		).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Expand all files" }));

		expect(onToggleCollapseAll).toHaveBeenCalled();
	});
});

describe("DiffToolbar half/full toggle", () => {
	it("offers to fill the window while the diff sits beside the terminal", () => {
		const onToggleMode = vi.fn();
		renderToolbar({ mode: "half", onToggleMode });

		fireEvent.click(
			screen.getByRole("button", { name: "Fill the window with diff" }),
		);

		expect(onToggleMode).toHaveBeenCalled();
	});

	it("offers to bring the terminal back while the diff fills the window", () => {
		const onToggleMode = vi.fn();
		renderToolbar({ mode: "full", onToggleMode });

		fireEvent.click(
			screen.getByRole("button", { name: "Show terminal beside diff" }),
		);

		expect(onToggleMode).toHaveBeenCalled();
	});

	it("shows no toggle on the standalone diff route", () => {
		renderToolbar();

		expect(
			screen.queryByRole("button", { name: /Fill the window|Show terminal/ }),
		).toBeNull();
	});
});
