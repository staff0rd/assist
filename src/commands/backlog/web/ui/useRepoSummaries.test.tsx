// @vitest-environment jsdom
import { render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RepoSelectionContext } from "../../../sessions/web/ui/useRepoSelectionContext";
import { SessionLaunchContext } from "../../../sessions/web/ui/useSessionLaunchContext";
import { RepoSummaryChips } from "./components/RepoSummaryChips";
import { useRepoSummaries } from "./useRepoSummaries";

vi.mock("../../../sessions/web/ui/useMachineNode", () => ({
	useMachineNode: () => undefined,
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function Providers({ children }: { children: React.ReactNode }) {
	return (
		<RepoSelectionContext.Provider
			value={{
				repos: ["/repos/other"],
				selectedCwd: "/repos/other",
				worktreeCwd: "",
				setSelectedCwd: () => {},
				cloneOn: (cwd) => cwd,
				originOf: () => undefined,
			}}
		>
			<SessionLaunchContext.Provider
				value={{
					launchAssist: () => {},
					launchAgentInStream: () => {},
					resumeSession: () => {},
					armUpdateReload: () => {},
					activateSession: () => {},
					sendInput: () => {},
				}}
			>
				{children}
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>
	);
}

function respond(status: number, body: unknown) {
	fetchMock.mockResolvedValue(Response.json(body, { status }));
}

afterEach(() => {
	fetchMock.mockReset();
});

describe("useRepoSummaries", () => {
	it("keeps summaries an empty array when the request fails", async () => {
		respond(502, { error: "relay failed" });

		const { result } = renderHook(() => useRepoSummaries(), {
			wrapper: Providers,
		});

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		await waitFor(() => expect(result.current.summaries).toEqual([]));
	});

	it("ignores a non-array success body", async () => {
		respond(200, { error: "unexpected" });

		const { result } = renderHook(() => useRepoSummaries(), {
			wrapper: Providers,
		});

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		await waitFor(() => expect(result.current.summaries).toEqual([]));
	});

	it("renders no chips instead of crashing on an error response", async () => {
		respond(500, { error: "boom" });

		const { container } = render(
			<Providers>
				<RepoSummaryChips sessions={[]} />
			</Providers>,
		);

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(container.textContent).toBe("");
	});
});
