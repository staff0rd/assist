// @vitest-environment jsdom
import { act, render as rtlRender, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RestartTarget } from "../../../../../../../../watch/restartRules";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import {
	LocalRestartContext,
	useLocalRestartContext,
} from "../../../useLocalRestartContext";
import { useWebserverRestart } from "../../../useWebserverRestart";
import { useNodeRestart } from "./useNodeRestart";
import type { Notices } from "./useNotices";

const { postRestart, awaitNodeRestarted } = vi.hoisted(() => ({
	postRestart:
		vi.fn<(target: string, node?: string) => Promise<{ ok: boolean }>>(),
	awaitNodeRestarted: vi.fn(),
}));

vi.mock("../../../postRestart", () => ({ postRestart }));
vi.mock(
	"./useNodeRestart/restartReporting/restartRemotely/awaitNodeRestarted",
	() => ({ awaitNodeRestarted }),
);

let reload: ReturnType<typeof vi.fn>;
let notices: Notices;

beforeEach(() => {
	vi.useFakeTimers();
	reload = vi.fn();
	postRestart.mockReset();
	postRestart.mockResolvedValue({ ok: true });
	awaitNodeRestarted.mockReset();
	awaitNodeRestarted.mockResolvedValue({ status: { running: "1.2.3" } });
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({ ok: true })),
	);
	Object.defineProperty(globalThis, "location", {
		configurable: true,
		value: { reload },
	});
	notices = {
		busy: {},
		mark: vi.fn(),
		back: null,
		setBack: vi.fn(),
		clearBack: vi.fn(),
		error: null,
		setError: vi.fn(),
		clearError: vi.fn(),
	};
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

function entry(
	name: string,
	local: boolean,
	restart: RestartTarget[],
): NodeUpdateEntry {
	return {
		name,
		local,
		status: {
			nodeName: name,
			installDir: "/opt/assist",
			running: "1.2.2",
			built: "1.2.3",
			restart,
			daemonReachable: true,
			loop: { phase: "waiting", since: new Date().toISOString() },
			history: [],
		},
	};
}

function render() {
	return renderHook(
		({ reconnecting }: { reconnecting: boolean }) =>
			useNodeRestart(
				useWebserverRestart("webserver", reconnecting),
				notices,
				vi.fn(),
			),
		{ initialProps: { reconnecting: false } },
	);
}

type ShellProps = { reconnecting: boolean; showUpdates: boolean };

function renderInShell() {
	let restart: ((entry: NodeUpdateEntry) => Promise<void>) | undefined;
	function Updates() {
		restart = useNodeRestart(
			useLocalRestartContext(),
			notices,
			vi.fn(),
		).restart;
		return null;
	}
	function Shell({ reconnecting, showUpdates }: ShellProps) {
		const web = useWebserverRestart("webserver", reconnecting);
		return (
			<LocalRestartContext.Provider value={web}>
				{showUpdates && <Updates />}
			</LocalRestartContext.Provider>
		);
	}
	const view = rtlRender(<Shell reconnecting={false} showUpdates />);
	return {
		restart: (entry: NodeUpdateEntry) => restart?.(entry),
		rerender: (props: ShellProps) => view.rerender(<Shell {...props} />),
	};
}

async function serverBounces(
	rerender: (props: { reconnecting: boolean }) => void,
) {
	rerender({ reconnecting: true });
	rerender({ reconnecting: false });
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1_000);
	});
}

describe("useNodeRestart", () => {
	it("restarts both and reloads for a local daemon-only restart", async () => {
		const { result, rerender } = render();

		await act(() => result.current.restart(entry("me", true, ["daemon"])));
		await serverBounces(rerender);

		expect(postRestart).toHaveBeenCalledWith("both");
		expect(awaitNodeRestarted).not.toHaveBeenCalled();
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("restarts the web server and reloads for a local webserver restart", async () => {
		const { result, rerender } = render();

		await act(() => result.current.restart(entry("me", true, ["webserver"])));
		await serverBounces(rerender);

		expect(postRestart).toHaveBeenCalledWith("webserver");
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("restarts only the daemon of a remote node and reports without reloading", async () => {
		const { result, rerender } = render();

		await act(() => result.current.restart(entry("far", false, ["daemon"])));
		await serverBounces(rerender);

		expect(postRestart).toHaveBeenCalledWith("daemon", "far");
		expect(notices.setBack).toHaveBeenCalledWith("far is running v1.2.3");
		expect(reload).not.toHaveBeenCalled();
	});

	it("still reloads when the Updates view unmounts during a local restart", async () => {
		const shell = renderInShell();

		await act(() => shell.restart(entry("me", true, ["daemon"])));
		shell.rerender({ reconnecting: false, showUpdates: false });
		shell.rerender({ reconnecting: true, showUpdates: false });
		shell.rerender({ reconnecting: false, showUpdates: false });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_000);
		});

		expect(postRestart).toHaveBeenCalledWith("both");
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("restarts remote nodes before the local daemon-only node, then reloads", async () => {
		const { result, rerender } = render();

		await act(() =>
			result.current.restartReady([
				entry("me", true, ["daemon"]),
				entry("far", false, ["daemon"]),
			]),
		);
		await serverBounces(rerender);

		expect(postRestart.mock.calls).toEqual([["daemon", "far"], ["both"]]);
		expect(reload).toHaveBeenCalledTimes(1);
	});
});
