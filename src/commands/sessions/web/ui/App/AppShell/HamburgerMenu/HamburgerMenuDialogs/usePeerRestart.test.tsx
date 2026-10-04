// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkState } from "../../../../../../daemon/links/LinkStatus";
import { NodeSelectionContext } from "../../../../useNodeSelectionContext";
import { usePeerRestart } from "./usePeerRestart";

let fetchMock: ReturnType<typeof vi.fn>;

function selection(state: LinkState) {
	return {
		nodes: {
			local: "wsl",
			links: [
				{
					name: "win",
					url: "http://win:3100",
					state,
					peerVersion: "0.759.1",
				},
			],
		},
		names: ["wsl", "win"],
		visible: true,
		selected: "win",
		select: () => {},
	};
}

function render(initial: LinkState) {
	let current = selection(initial);
	const wrapper = ({ children }: { children: ReactNode }) => (
		<NodeSelectionContext.Provider value={current}>
			{children}
		</NodeSelectionContext.Provider>
	);
	const hook = renderHook(() => usePeerRestart(), { wrapper });
	return {
		...hook,
		setState(state: LinkState) {
			current = selection(state);
			hook.rerender();
		},
	};
}

beforeEach(() => {
	vi.useFakeTimers();
	fetchMock = vi.fn().mockResolvedValue({ ok: true });
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe("usePeerRestart", () => {
	it("posts the restart to the peer", async () => {
		const { result } = render("connected");

		await act(() => result.current.restart("win"));

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/restart?target=both&node=win",
			{ method: "POST" },
		);
	});

	it("toasts once the peer's link drops and reconnects", async () => {
		const { result, setState } = render("connected");

		await act(() => result.current.restart("win"));
		expect(result.current.back).toBeNull();

		setState("connecting");
		expect(result.current.back).toBeNull();

		setState("connected");
		expect(result.current.back).toBe("win is back (v0.759.1)");
	});

	it("names the first broken doctor hop when the request fails", async () => {
		fetchMock.mockImplementation(async (url: string) =>
			url.startsWith("/api/restart")
				? {
						ok: false,
						status: 502,
						json: async () => ({ error: "win unreachable: ECONNREFUSED" }),
					}
				: {
						ok: true,
						json: async () => ({
							hop: {
								hop: "web",
								ok: false,
								error: "connection refused",
								remediation: "is win's web server running?",
							},
						}),
					},
		);
		const { result } = render("connected");

		let started = true;
		await act(async () => {
			started = await result.current.restart("win");
		});

		expect(started).toBe(false);
		expect(fetchMock).toHaveBeenCalledWith("/api/node-doctor?link=win");
		expect(result.current.error).toBe(
			"Restart win failed (win unreachable: ECONNREFUSED): web hop failed: connection refused — is win's web server running?",
		);
	});

	it("reports the peer not coming back after the timeout", async () => {
		const { result, setState } = render("connected");
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ hop: null }),
		});

		await act(() => result.current.restart("win"));
		setState("disconnected");
		await act(async () => {
			await vi.advanceTimersByTimeAsync(90_000);
		});

		expect(result.current.back).toBeNull();
		expect(result.current.error).toBe("win did not come back");
	});
});
