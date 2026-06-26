import { beforeEach, describe, expect, it, vi } from "vitest";
import { ASSIST_VERSION } from "./buildHello";
import { recentDaemonLogLines, setDaemonLogSink } from "./daemonLog";
import { handleInbound } from "./handleInbound";
import { createState } from "./WindowsProxyState";
import type { WindowsVersionCheck } from "./windowsVersionCheck";

const versionCheck = vi.hoisted(() => ({
	mode: "block" as WindowsVersionCheck,
}));
vi.mock("./windowsVersionCheck", () => ({
	windowsVersionCheck: () => versionCheck.mode,
}));

describe("handleInbound log relay", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		setDaemonLogSink(() => {});
	});

	it("relays a windows daemon log line into this daemon's stream tagged [windows], without broadcasting", () => {
		const broadcast = vi.fn();
		const state = createState(
			broadcast,
			() => {},
			() => {},
		);
		const windowsLine = "2026-06-25T00:00:00.000Z [4242] relay-marker";

		handleInbound(state, JSON.stringify({ type: "log", line: windowsLine }));

		expect(recentDaemonLogLines()).toContain(`[windows] ${windowsLine}`);
		// browsers must not be spammed with daemon log lines
		expect(broadcast).not.toHaveBeenCalled();
	});

	it("ignores a log message with no line", () => {
		const broadcast = vi.fn();
		const state = createState(
			broadcast,
			() => {},
			() => {},
		);

		handleInbound(state, JSON.stringify({ type: "log" }));

		expect(broadcast).not.toHaveBeenCalled();
	});
});

describe("handleInbound version-check escape hatch", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		setDaemonLogSink(() => {});
		versionCheck.mode = "block";
	});

	function stateWithMismatchSpy() {
		const onVersionMismatch = vi.fn();
		const state = createState(
			() => {},
			() => {},
			onVersionMismatch,
		);
		return { state, onVersionMismatch };
	}

	function sendMismatch(state: ReturnType<typeof createState>): void {
		handleInbound(
			state,
			JSON.stringify({ type: "hello", version: "0.0.0-mismatch" }),
		);
	}

	it("triggers the mismatch handler under block (default)", () => {
		const { state, onVersionMismatch } = stateWithMismatchSpy();
		sendMismatch(state);
		expect(onVersionMismatch).toHaveBeenCalledWith("0.0.0-mismatch");
	});

	it("logs and proceeds without healing under warn", () => {
		versionCheck.mode = "warn";
		const { state, onVersionMismatch } = stateWithMismatchSpy();
		sendMismatch(state);
		expect(onVersionMismatch).not.toHaveBeenCalled();
		expect(
			recentDaemonLogLines().some((l) => l.includes("proceeding with warning")),
		).toBe(true);
	});

	it("skips the check entirely under off", () => {
		versionCheck.mode = "off";
		const { state, onVersionMismatch } = stateWithMismatchSpy();
		sendMismatch(state);
		expect(onVersionMismatch).not.toHaveBeenCalled();
		expect(
			recentDaemonLogLines().some((l) => l.includes("check disabled")),
		).toBe(true);
	});

	it("does not trigger on a compatible hello regardless of mode", () => {
		versionCheck.mode = "block";
		const { state, onVersionMismatch } = stateWithMismatchSpy();
		handleInbound(
			state,
			JSON.stringify({ type: "hello", version: ASSIST_VERSION }),
		);
		expect(onVersionMismatch).not.toHaveBeenCalled();
	});
});
