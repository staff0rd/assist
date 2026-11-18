// @vitest-environment jsdom
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchEntries } from "../../ConfigView/useConfigEntries/fetchEntries";
import { RepoSelectionContext } from "../../../useRepoSelectionContext";
import { TextSizeProvider } from "./TextSizeProvider";

vi.mock("../../ConfigView/useConfigEntries/fetchEntries", () => ({
	fetchEntries: vi.fn(async () => [
		{ key: "sessions.textSizeOffset", value: 3 },
	]),
}));

afterEach(cleanup);

describe("TextSizeProvider", () => {
	it("publishes the local node's offset as a CSS variable", async () => {
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
				<TextSizeProvider localCwd="/local/repo">{null}</TextSizeProvider>
			</RepoSelectionContext.Provider>,
		);

		await waitFor(() =>
			expect(
				document.documentElement.style.getPropertyValue(
					"--session-text-offset",
				),
			).toBe("3px"),
		);
		expect(fetchEntries).toHaveBeenLastCalledWith("/local/repo", undefined);
	});
});
