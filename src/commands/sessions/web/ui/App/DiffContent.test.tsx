// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffContent } from "./DiffContent";

vi.mock("./DiffContent/useDiffContent", () => ({
	useDiffContent: () => ({
		filters: {},
		treePanel: {},
		collapseAll: {},
		collapsedFiles: {},
		comments: {},
		revert: {},
		scopeState: {},
	}),
}));
vi.mock("./DiffContent/DiffToolbar", () => ({ DiffToolbar: () => null }));
vi.mock("./DiffContent/DiffContentBody", () => ({
	DiffContentBody: () => null,
}));
vi.mock("./DiffContent/DiffHeadSourceProvider", () => ({
	DiffHeadSourceProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("./DiffContent/DiffSnackbars", () => ({ DiffSnackbars: () => null }));

afterEach(cleanup);

function renderContent(onClose?: () => void) {
	render(
		<DiffContent
			cwd="/repo"
			scope="all"
			onScopeChange={() => {}}
			sessions={[]}
			sendInput={() => {}}
			onClose={onClose}
		/>,
	);
}

describe("DiffContent", () => {
	it("pins a Close footer that calls onClose", () => {
		const onClose = vi.fn();
		renderContent(onClose);

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		expect(onClose).toHaveBeenCalledOnce();
	});

	it("renders no Close footer without onClose", () => {
		renderContent();

		expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
	});
});
