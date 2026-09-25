// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import type { FileData } from "react-diff-view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffFileList } from "./DiffFileList";

vi.mock("../../FileDiffBody", () => ({
	FileDiffBody: () => <div>diff body</div>,
}));

afterEach(cleanup);

function file(newRevision: string): FileData {
	return {
		hunks: [],
		oldEndingNewLine: true,
		newEndingNewLine: true,
		oldMode: "100644",
		newMode: "100644",
		oldRevision: "aaa",
		newRevision,
		oldPath: "src/app.ts",
		newPath: "src/app.ts",
		type: "modify",
	} as FileData;
}

function List({ files }: { files: FileData[] }) {
	const [collapsed, setCollapsed] = useState<string[]>([]);

	return (
		<DiffFileList
			files={files}
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

describe("DiffFileList", () => {
	it("keeps a file collapsed when a refresh changes its blob revisions", () => {
		const { rerender } = render(<List files={[file("bbb")]} />);
		fireEvent.click(screen.getByText("src/app.ts"));
		expect(screen.queryByText("diff body")).toBeNull();

		rerender(<List files={[file("ccc")]} />);

		expect(screen.queryByText("diff body")).toBeNull();
	});

	it("renders a file expanded when the parent reports it as not collapsed", () => {
		render(<List files={[file("bbb")]} />);

		expect(screen.getByText("diff body")).toBeTruthy();
	});
});
