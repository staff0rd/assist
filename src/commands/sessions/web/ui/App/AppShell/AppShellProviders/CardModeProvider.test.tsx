// @vitest-environment jsdom
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchEntries } from "../../ConfigView/useConfigEntries/fetchEntries";
import { RepoSelectionContext } from "../../../useRepoSelectionContext";
import { CardModeProvider } from "./CardModeProvider";

vi.mock("../../ConfigView/useConfigEntries/fetchEntries", () => ({
	fetchEntries: vi.fn(async () => []),
}));

afterEach(cleanup);

function renderProvider(localCwd: string) {
	render(
		<RepoSelectionContext.Provider
			value={{
				repos: [],
				selectedCwd: "/remote/repo",
				selectedNode: "remote",
				worktreeCwd: "",
				setSelectedCwd: () => {},
				cloneOn: (cwd) => cwd,
				originOf: () => undefined,
			}}
		>
			<CardModeProvider localCwd={localCwd}>{null}</CardModeProvider>
		</RepoSelectionContext.Provider>,
	);
}

describe("CardModeProvider", () => {
	it("reads card mode from the local node with the server's repo", async () => {
		renderProvider("/local/repo");

		await waitFor(() =>
			expect(fetchEntries).toHaveBeenLastCalledWith("/local/repo", undefined),
		);
	});

	it("still reads card mode when the server was started outside a repo", async () => {
		renderProvider("");

		await waitFor(() =>
			expect(fetchEntries).toHaveBeenLastCalledWith("/remote/repo", undefined),
		);
	});
});
