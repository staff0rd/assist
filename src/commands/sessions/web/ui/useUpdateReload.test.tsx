// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import type { SessionInfo, SessionStatus } from "./types";
import type { SuccessNotice } from "./useNotices";
import { useUpdateReload } from "./useUpdateReload";

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

beforeEach(() => {
	reload = vi.fn();
	setSuccess = vi.fn();
	globalThis.sessionStorage.clear();
	Object.defineProperty(globalThis, "location", {
		configurable: true,
		value: { reload },
	});
});

afterEach(() => {
	vi.restoreAllMocks();
});

type Props = { sessions: SessionInfo[]; reconnecting: boolean };

function render(initial: Props) {
	return renderHook(
		({ sessions, reconnecting }: Props) =>
			useUpdateReload(sessions, reconnecting, setSuccess),
		{ initialProps: initial },
	);
}

describe("useUpdateReload", () => {
	it("reloads after the daemon restart reconnect surfaces the done update session", () => {
		const { result, rerender } = render({
			sessions: [updateSession("u1", "running")],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [], reconnecting: true });
		expect(reload).not.toHaveBeenCalled();

		rerender({ sessions: [updateSession("u2", "done")], reconnecting: false });
		expect(reload).toHaveBeenCalledTimes(1);
		expect(
			globalThis.sessionStorage.getItem("assist:reloaded-after-update"),
		).toBe("1");
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

		expect(reload).not.toHaveBeenCalled();
	});

	it("reloads only for the newly completed update, not the pre-existing done session", () => {
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

		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("does not reload when the update ends in error after a reconnect", () => {
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

		expect(reload).not.toHaveBeenCalled();
	});

	it("does not reload when the update fails without restarting the daemon", () => {
		const { result, rerender } = render({
			sessions: [updateSession("u1", "running")],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [updateSession("u1", "error")], reconnecting: false });

		expect(reload).not.toHaveBeenCalled();
	});

	it("does not reload without a reconnect, even if a done update session appears", () => {
		const { result, rerender } = render({
			sessions: [],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [updateSession("u1", "done")], reconnecting: false });

		expect(reload).not.toHaveBeenCalled();
	});

	it("does not reload when not armed", () => {
		const { rerender } = render({
			sessions: [updateSession("old", "done")],
			reconnecting: true,
		});

		rerender({ sessions: [updateSession("old", "done")], reconnecting: false });

		expect(reload).not.toHaveBeenCalled();
	});

	it("does not reload for a non-update session after a reconnect", () => {
		const { result, rerender } = render({
			sessions: [],
			reconnecting: false,
		});

		act(() => result.current.armUpdateReload());
		rerender({ sessions: [], reconnecting: true });
		rerender({ sessions: [otherSession("c1", "done")], reconnecting: false });

		expect(reload).not.toHaveBeenCalled();
	});
});
