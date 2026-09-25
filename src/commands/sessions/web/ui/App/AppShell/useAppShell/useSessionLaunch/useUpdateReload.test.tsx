// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import type { SessionInfo, SessionStatus } from "../../../../types";
import type { SuccessNotice } from "../../../../useNotices";
import { useUpdateReload } from "./useUpdateReload";

const { postRestart } = vi.hoisted(() => ({
	postRestart: vi.fn<(target: string) => Promise<{ ok: boolean }>>(),
}));

vi.mock("../../postRestart", () => ({ postRestart }));

function updateSession(id: string, status: SessionStatus): SessionInfo {
	return {
		id,
		name: id,
		commandType: "assist",
		assistArgs: ["update"],
		status,
		startedAt: 0,
		cwd: "/repo",
	};
}

function otherSession(id: string, status: SessionStatus): SessionInfo {
	return {
		id,
		name: id,
		commandType: "claude",
		status,
		startedAt: 0,
		cwd: "/repo",
	};
}

let reload: ReturnType<typeof vi.fn>;
let setSuccess: Mock<(notice: SuccessNotice) => void>;
let setError: Mock<(message: string) => void>;

beforeEach(() => {
	reload = vi.fn();
	setSuccess = vi.fn();
	setError = vi.fn();
	postRestart.mockReset();
	postRestart.mockResolvedValue({ ok: true });
	globalThis.sessionStorage.clear();
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({ ok: true })),
	);
	Object.defineProperty(globalThis, "location", {
		configurable: true,
		value: { reload },
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

type Props = { sessions: SessionInfo[]; reconnecting: boolean };

function render(initial: Props) {
	return renderHook(
		({ sessions, reconnecting }: Props) =>
			useUpdateReload(sessions, reconnecting, setSuccess, setError),
		{ initialProps: initial },
	);
}

function armAndCompleteUpdate() {
	const { result, rerender } = render({
		sessions: [updateSession("u1", "running")],
		reconnecting: false,
	});

	act(() => result.current.armUpdateReload());
	rerender({ sessions: [], reconnecting: true });
	rerender({ sessions: [updateSession("u2", "done")], reconnecting: false });

	return { rerender };
}

function reconnectWebserver(rerender: (props: Props) => void) {
	rerender({ sessions: [updateSession("u2", "done")], reconnecting: true });
	rerender({ sessions: [updateSession("u2", "done")], reconnecting: false });
}

describe("useUpdateReload", () => {
	it("restarts the web server once the daemon reconnect surfaces the done update session", () => {
		armAndCompleteUpdate();

		expect(postRestart).toHaveBeenCalledWith("webserver");
		expect(reload).not.toHaveBeenCalled();
		expect(
			globalThis.sessionStorage.getItem("assist:reloaded-after-update"),
		).toBeNull();
	});

	it("reloads and leaves a breadcrumb only once the re-execed web server is back", async () => {
		const { rerender } = armAndCompleteUpdate();

		rerender({ sessions: [updateSession("u2", "done")], reconnecting: true });
		expect(reload).not.toHaveBeenCalled();
		expect(
			globalThis.sessionStorage.getItem("assist:reloaded-after-update"),
		).toBeNull();

		rerender({ sessions: [updateSession("u2", "done")], reconnecting: false });
		await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
		expect(
			globalThis.sessionStorage.getItem("assist:reloaded-after-update"),
		).toBe("1");
	});

	it("requests the web-server restart only once", () => {
		const { rerender } = armAndCompleteUpdate();

		rerender({
			sessions: [updateSession("u2", "done"), updateSession("u3", "done")],
			reconnecting: false,
		});

		expect(postRestart).toHaveBeenCalledTimes(1);
	});

	it("surfaces an error when the web-server restart request throws", async () => {
		postRestart.mockRejectedValue(new Error("boom"));

		armAndCompleteUpdate();

		await waitFor(() =>
			expect(setError).toHaveBeenCalledWith("Failed to restart web server"),
		);
		expect(reload).not.toHaveBeenCalled();
	});

	it("surfaces an error when the web server rejects the restart request", async () => {
		postRestart.mockResolvedValue({ ok: false });

		armAndCompleteUpdate();

		await waitFor(() =>
			expect(setError).toHaveBeenCalledWith("Failed to restart web server"),
		);
	});

	it("does not reload after a failed restart request, even on a later reconnect", async () => {
		postRestart.mockRejectedValue(new Error("boom"));

		const { rerender } = armAndCompleteUpdate();
		await waitFor(() => expect(setError).toHaveBeenCalled());

		reconnectWebserver(rerender);

		expect(reload).not.toHaveBeenCalled();
	});

	it("surfaces a confirmation notice on mount after a reload breadcrumb", () => {
		globalThis.sessionStorage.setItem("assist:reloaded-after-update", "1");

		render({ sessions: [], reconnecting: false });

		expect(setSuccess).toHaveBeenCalledWith({
			message: "Reloaded after updating assist",
			sessionId: null,
		});
		expect(
			globalThis.sessionStorage.getItem("assist:reloaded-after-update"),
		).toBeNull();
	});

	it("does not surface a confirmation notice without a breadcrumb", () => {
		render({ sessions: [], reconnecting: false });

		expect(setSuccess).not.toHaveBeenCalled();
	});

	it("ignores a restored/pre-existing done update session across a reconnect", () => {
		const { result, rerender } = render({
			sessions: [updateSession("pre", "done")],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [], reconnecting: true });
		rerender({
			sessions: [updateSession("pre", "done")],
			reconnecting: false,
		});

		expect(postRestart).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});

	it("restarts only for the newly completed update, not the pre-existing done session", () => {
		const { result, rerender } = render({
			sessions: [updateSession("pre", "done")],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [], reconnecting: true });
		rerender({
			sessions: [updateSession("pre", "done"), updateSession("new", "done")],
			reconnecting: false,
		});

		expect(postRestart).toHaveBeenCalledTimes(1);
	});

	it("does not restart when the update ends in error after a reconnect", () => {
		const { result, rerender } = render({
			sessions: [updateSession("u1", "running")],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [], reconnecting: true });
		rerender({
			sessions: [updateSession("u1", "error")],
			reconnecting: false,
		});

		expect(postRestart).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});

	it("does not restart when the update fails without restarting the daemon", () => {
		const { result, rerender } = render({
			sessions: [updateSession("u1", "running")],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [updateSession("u1", "error")], reconnecting: false });

		expect(postRestart).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});

	it("does not restart without a reconnect, even if a done update session appears", () => {
		const { result, rerender } = render({
			sessions: [],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [updateSession("u1", "done")], reconnecting: false });

		expect(postRestart).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});

	it("does not restart when not armed", () => {
		const { rerender } = render({
			sessions: [updateSession("old", "done")],
			reconnecting: true,
		});

		rerender({ sessions: [updateSession("old", "done")], reconnecting: false });

		expect(postRestart).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});

	it("does not restart for a non-update session after a reconnect", () => {
		const { result, rerender } = render({
			sessions: [],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [], reconnecting: true });
		rerender({ sessions: [otherSession("c1", "done")], reconnecting: false });

		expect(postRestart).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});
});
