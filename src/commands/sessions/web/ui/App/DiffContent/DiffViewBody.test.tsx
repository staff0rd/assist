// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import type { FileData } from "react-diff-view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffViewBody } from "./DiffViewBody";
import { scrollToDiffFile } from "./DiffViewBody/scrollToDiffFile";

vi.mock("../FileDiffBody", () => ({
	FileDiffBody: () => <div>diff body</div>,
}));

vi.mock("./DiffViewBody/scrollToDiffFile", () => ({
	scrollToDiffFile: vi.fn(),
}));

afterEach(cleanup);

const file = {
	hunks: [],
	oldPath: "src/app.ts",
	newPath: "src/app.ts",
	type: "modify",
} as unknown as FileData;

function Body() {
	const [collapsed, setCollapsed] = useState<string[]>([]);

	return (
		<DiffViewBody
			files={[file]}
			treeVisible
			viewType="unified"
			cwd="/repo"
			isCollapsed={(path) => collapsed.includes(path)}
			onToggleCollapsed={(path) =>
				setCollapsed((prev) =>
					prev.includes(path)
						? prev.filter((p) => p !== path)
						: [...prev, path],
				)
			}
			emptyMessage="No changes"
		/>
	);
}

describe("DiffViewBody", () => {
	it("expands a collapsed file and scrolls to it when its tree row is clicked", () => {
		render(<Body />);
		fireEvent.click(screen.getByText("src/app.ts"));
		expect(screen.queryByText("diff body")).toBeNull();

		fireEvent.click(screen.getByText("app.ts"));

		expect(screen.getByText("diff body")).toBeTruthy();
		expect(scrollToDiffFile).toHaveBeenCalledWith("src/app.ts");
	});

	it("leaves an expanded file expanded when its tree row is clicked", () => {
		render(<Body />);

		fireEvent.click(screen.getByText("app.ts"));

		expect(screen.getByText("diff body")).toBeTruthy();
	});
});
