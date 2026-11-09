// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRunAction } from "../../../resumeSessionAction";
import {
	RepoSelectionContext,
	type RepoSelection,
} from "../../../useRepoSelectionContext";
import { useServerRuns } from "../../useServerRuns";
import { TopNavActions } from "./TopNavActions";

vi.mock("../../useServerRuns", () => ({ useServerRuns: vi.fn() }));
vi.mock("./TopNavActions/ReviewDropdown", () => ({
	ReviewDropdown: () => null,
}));

afterEach(cleanup);

const selection: RepoSelection = {
	repos: ["/repo"],
	selectedCwd: "/repo",
	selectedNode: "box",
	worktreeCwd: "/repo",
	setSelectedCwd: () => {},
	cloneOn: (cwd) => cwd,
	originOf: () => undefined,
};

function renderTopNav() {
	vi.mocked(useServerRuns).mockReturnValue([{ name: "web" }, { name: "api" }]);
	const send = vi.fn();
	render(
		<RepoSelectionContext.Provider value={selection}>
			<TopNavActions
				onCreateAssist={vi.fn()}
				onStartRun={createRunAction(send)}
			/>
		</RepoSelectionContext.Provider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "server" }));
	return send;
}

const createRun = (replace?: boolean) => ({
	type: "create-run",
	runName: "api",
	cwd: "/repo",
	replace,
	launchedFrom: undefined,
	node: "box",
});

describe("TopNavActions server menu", () => {
	it("sends create-run without replace on a plain click", () => {
		const send = renderTopNav();

		fireEvent.click(screen.getByText("api"));

		expect(send).toHaveBeenCalledWith(createRun());
	});

	it("sends create-run with replace on a shift+click", () => {
		const send = renderTopNav();

		fireEvent.click(screen.getByText("api"), { shiftKey: true });

		expect(send).toHaveBeenCalledWith(createRun(true));
	});
});
