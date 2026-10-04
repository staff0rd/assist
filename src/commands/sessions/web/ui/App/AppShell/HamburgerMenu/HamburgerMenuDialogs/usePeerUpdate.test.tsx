// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import type { LinkState } from "../../../../../../daemon/links/LinkStatus";
import type { SessionInfo } from "../../../../types";
import { NodeSelectionContext } from "../../../../useNodeSelectionContext";
import { SessionLaunchContext } from "../../../../useSessionLaunchContext";
import { usePeerUpdate } from "./usePeerUpdate";

let fetchMock: ReturnType<typeof vi.fn>;
let launchAssist: Mock<(assistArgs: string[]) => void>;

type Props = { state: LinkState; version: string; sessions: SessionInfo[] };

const doneUpdate = makeSessionInfo({
	id: "win:u1",
	commandType: "assist",
	assistArgs: ["update"],
	status: "done",
	node: "win",
});

function render(initial: Props) {
	let current = initial;
	const wrapper = ({ children }: { children: ReactNode }) => (
		<NodeSelectionContext.Provider
			value={{
				nodes: {
					local: "wsl",
					links: [
						{
							name: "win",
							url: "http://win:3100",
							state: current.state,
							peerVersion: current.version,
						},
					],
				},
				names: ["wsl", "win"],
				visible: true,
				selected: "win",
				select: () => {},
			}}
		>
			<SessionLaunchContext.Provider
				value={{
					launchAssist,
					launchAgentInStream: () => {},
					resumeSession: () => {},
					armUpdateReload: () => {},
				}}
			>
				{children}
			</SessionLaunchContext.Provider>
		</NodeSelectionContext.Provider>
	);
	const hook = renderHook(
		({ sessions }: { sessions: SessionInfo[] }) => usePeerUpdate(sessions),
		{ wrapper, initialProps: { sessions: initial.sessions } },
	);
	return {
		...hook,
		set(next: Partial<Props>) {
			current = { ...current, ...next };
			hook.rerender({ sessions: current.sessions });
		},
	};
}

beforeEach(() => {
	fetchMock = vi.fn().mockResolvedValue({ ok: true });
	launchAssist = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("usePeerUpdate", () => {
	it("launches assist update on a connected peer", () => {
		const { result } = render({
			state: "connected",
			version: "0.759.1",
			sessions: [],
		});

		act(() => result.current.update("win"));

		expect(launchAssist).toHaveBeenCalledWith(["update"], undefined, {
			node: "win",
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("restarts the peer's web server once its update card completes, then toasts the new version", async () => {
		const { result, set } = render({
			state: "connected",
			version: "0.759.1",
			sessions: [],
		});

		act(() => result.current.update("win"));
		set({ state: "connecting" });
		set({ state: "connected", version: "0.760.0", sessions: [doneUpdate] });

		await waitFor(() =>
			expect(fetchMock).toHaveBeenCalledWith(
				"/api/restart?target=webserver&node=win",
				{ method: "POST" },
			),
		);
		expect(result.current.back).toBeNull();

		set({ state: "connecting" });
		set({ state: "connected" });

		expect(result.current.back).toBe("win updated to v0.760.0");
	});

	it("ignores update cards that completed before the update was requested", () => {
		const { result, set } = render({
			state: "connected",
			version: "0.759.1",
			sessions: [doneUpdate],
		});

		act(() => result.current.update("win"));
		set({ state: "connecting" });
		set({ state: "connected" });

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each<LinkState>(["disconnected", "version-blocked"])(
		"falls back to the peer's self-update when the link is %s",
		async (state) => {
			let finish: (res: { ok: boolean }) => void = () => {};
			fetchMock.mockReturnValue(
				new Promise((resolve) => {
					finish = resolve;
				}),
			);
			const { result, set } = render({
				state,
				version: "0.759.1",
				sessions: [],
			});

			act(() => result.current.update("win"));

			expect(launchAssist).not.toHaveBeenCalled();
			expect(fetchMock).toHaveBeenCalledWith("/api/self-update?node=win", {
				method: "POST",
			});
			expect(result.current.progress).toBe("Updating assist on win…");

			await act(async () => finish({ ok: true }));
			expect(result.current.progress).toBeNull();

			set({ state: "connected", version: "0.760.0" });
			expect(result.current.back).toBe("win updated to v0.760.0");
		},
	);

	it("reports a failed self-update with the first broken doctor hop", async () => {
		fetchMock.mockImplementation(async (url: string) =>
			url.startsWith("/api/self-update")
				? {
						ok: false,
						status: 500,
						json: async () => ({ error: "assist update exited with code 1" }),
					}
				: { ok: true, json: async () => ({ hop: null }) },
		);
		const { result } = render({
			state: "disconnected",
			version: "0.759.1",
			sessions: [],
		});

		act(() => result.current.update("win"));

		await waitFor(() =>
			expect(result.current.error).toBe(
				"Update win failed (assist update exited with code 1)",
			),
		);
		expect(result.current.progress).toBeNull();
	});
});
