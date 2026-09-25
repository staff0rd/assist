// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { FileData } from "react-diff-view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffFileTree } from "./DiffFileTree";

afterEach(cleanup);

function file(path: string): FileData {
	return {
		oldPath: path,
		newPath: path,
		type: "modify",
		hunks: [],
	} as unknown as FileData;
}

describe("DiffFileTree", () => {
	it("renders collapsed directory chains and reports the clicked file key", () => {
		const onSelectFile = vi.fn();
		render(
			<DiffFileTree
				files={[file("src/web/ui/App.tsx")]}
				onSelectFile={onSelectFile}
			/>,
		);

		expect(screen.getByText("src/web/ui")).toBeTruthy();
		fireEvent.click(screen.getByText("App.tsx"));

		expect(onSelectFile).toHaveBeenCalledWith("src/web/ui/App.tsx");
	});

	it("hides a directory's files while it is collapsed", () => {
		render(
			<DiffFileTree files={[file("src/app.ts")]} onSelectFile={vi.fn()} />,
		);

		fireEvent.click(screen.getByText("src"));
		expect(screen.queryByText("app.ts")).toBeNull();

		fireEvent.click(screen.getByText("src"));
		expect(screen.getByText("app.ts")).toBeTruthy();
	});

	it("shows each file's added and removed line counts", () => {
		render(
			<DiffFileTree
				files={[
					{
						oldPath: "src/app.ts",
						newPath: "src/app.ts",
						type: "modify",
						hunks: [
							{
								changes: [
									{ type: "insert" },
									{ type: "insert" },
									{ type: "insert" },
									{ type: "delete" },
								],
							},
						],
					} as unknown as FileData,
				]}
				onSelectFile={vi.fn()}
			/>,
		);

		expect(screen.getByText("+3")).toBeTruthy();
		expect(screen.getByText("-1")).toBeTruthy();
	});

	it("marks the active file's row as current", () => {
		render(
			<DiffFileTree
				files={[file("src/a.ts"), file("src/b.ts")]}
				activeFile="src/b.ts"
				onSelectFile={vi.fn()}
			/>,
		);

		expect(screen.getByText("b.ts").closest("[aria-current]")).toBeTruthy();
		expect(screen.getByText("a.ts").closest("[aria-current]")).toBeNull();
	});

	it("expands the active file's collapsed ancestors", () => {
		const { rerender } = render(
			<DiffFileTree files={[file("src/app.ts")]} onSelectFile={vi.fn()} />,
		);

		fireEvent.click(screen.getByText("src"));
		expect(screen.queryByText("app.ts")).toBeNull();

		rerender(
			<DiffFileTree
				files={[file("src/app.ts")]}
				activeFile="src/app.ts"
				onSelectFile={vi.fn()}
			/>,
		);

		expect(screen.getByText("app.ts")).toBeTruthy();
	});

	it("reverts a file from its row once the confirmation is accepted", () => {
		const onRevert = vi.fn();
		render(
			<DiffFileTree
				files={[file("src/app.ts")]}
				onSelectFile={vi.fn()}
				onRevert={onRevert}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Revert file" }));
		fireEvent.click(screen.getByRole("button", { name: "Revert" }));

		expect(onRevert).toHaveBeenCalledWith("src/app.ts");
	});

	it("reverts every visible file once the header confirmation is accepted", () => {
		const onRevertPaths = vi.fn();
		render(
			<DiffFileTree
				files={[file("src/app.ts"), file("src/web/ui.ts")]}
				onSelectFile={vi.fn()}
				onRevertPaths={onRevertPaths}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Revert all files" }));
		expect(
			screen.getByText(/discards all uncommitted changes to 2 files/),
		).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Revert" }));

		expect(onRevertPaths).toHaveBeenCalledWith(["src/web/ui.ts", "src/app.ts"]);
	});

	it("reverts nothing when the header confirmation is cancelled", () => {
		const onRevertPaths = vi.fn();
		render(
			<DiffFileTree
				files={[file("src/app.ts")]}
				onSelectFile={vi.fn()}
				onRevertPaths={onRevertPaths}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Revert all files" }));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(onRevertPaths).not.toHaveBeenCalled();
	});

	it("reverts only a folder's own subtree from its row", () => {
		const onRevertPaths = vi.fn();
		render(
			<DiffFileTree
				files={[
					file("src/web/a.ts"),
					file("src/web/nested/b.ts"),
					file("docs/c.md"),
				]}
				onSelectFile={vi.fn()}
				onRevertPaths={onRevertPaths}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Revert folder src/web" }),
		);
		expect(
			screen.getByText(
				/discards all uncommitted changes to 2 files in src\/web/,
			),
		).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Revert" }));

		expect(onRevertPaths).toHaveBeenCalledWith([
			"src/web/nested/b.ts",
			"src/web/a.ts",
		]);
	});

	it("reverts a nested folder without touching its siblings", () => {
		const onRevertPaths = vi.fn();
		render(
			<DiffFileTree
				files={[file("src/web/a.ts"), file("src/web/nested/b.ts")]}
				onSelectFile={vi.fn()}
				onRevertPaths={onRevertPaths}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Revert folder src/web/nested" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Revert" }));

		expect(onRevertPaths).toHaveBeenCalledWith(["src/web/nested/b.ts"]);
	});

	it("reverts a collapsed folder's files while its rows are hidden", () => {
		const onRevertPaths = vi.fn();
		render(
			<DiffFileTree
				files={[file("src/a.ts"), file("src/b.ts")]}
				onSelectFile={vi.fn()}
				onRevertPaths={onRevertPaths}
			/>,
		);

		fireEvent.click(screen.getByText("src"));
		expect(screen.queryByText("a.ts")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Revert folder src" }));
		fireEvent.click(screen.getByRole("button", { name: "Revert" }));

		expect(onRevertPaths).toHaveBeenCalledWith(["src/a.ts", "src/b.ts"]);
	});

	it("offers no folder revert control when reverting is unavailable", () => {
		render(
			<DiffFileTree files={[file("src/app.ts")]} onSelectFile={vi.fn()} />,
		);

		expect(
			screen.queryByRole("button", { name: "Revert folder src" }),
		).toBeNull();
	});

	it("offers no revert-all control when reverting is unavailable", () => {
		render(
			<DiffFileTree files={[file("src/app.ts")]} onSelectFile={vi.fn()} />,
		);

		expect(
			screen.queryByRole("button", { name: "Revert all files" }),
		).toBeNull();
	});

	it("offers no revert control when reverting is unavailable", () => {
		render(
			<DiffFileTree files={[file("src/app.ts")]} onSelectFile={vi.fn()} />,
		);

		expect(screen.queryByRole("button", { name: "Revert file" })).toBeNull();
	});

	it("renders nothing when no files are in the diff", () => {
		const { container } = render(
			<DiffFileTree files={[]} onSelectFile={vi.fn()} />,
		);

		expect(container.firstChild).toBeNull();
	});
});
