import { describe, expect, it, vi } from "vitest";
import { createHarnessSessionAction } from "./createHarnessSessionAction";
import {
	dismissSessionAction,
	restartSessionAction,
} from "./resumeSessionAction";
import { handleClear } from "./useSessionSocket/useWsConnection/useWebSocket/connectWithReconnect/createWsConnection/handleWsMessage/handleClear";
import { handleOutput } from "./useSessionSocket/useWsConnection/useWebSocket/connectWithReconnect/createWsConnection/handleWsMessage/handleOutput";
import { handleSnapshot } from "./useSessionSocket/useWsConnection/useWebSocket/connectWithReconnect/createWsConnection/handleWsMessage/handleSnapshot";
import type { WsDispatch } from "./useSessionSocket/useWsConnection/useWebSocket/WsDispatch";
import { outputAction } from "./useSessionSocket/useSessionActions/outputAction";
import { createAssistSessionAction } from "./createAssistSessionAction";

function terminalState() {
	const buffers = new Map<string, string>();
	const handlers = new Map<string, (data: string) => void>();
	const written: string[] = [];
	const unsubscribe = outputAction(
		vi.fn(),
		buffers,
		handlers,
	)("5", (data) => written.push(data));
	const dispatch = {
		buffers: { current: buffers },
		handlers: { current: handlers },
		markInitialized: vi.fn(),
	} as unknown as WsDispatch;
	return { buffers, written, unsubscribe, dispatch };
}

describe("createHarnessSessionAction", () => {
	it.each(["claude", "codex"])(
		"names the chosen %s harness and asks for the prompt dropdown's auto mode",
		(harness) => {
			const send = vi.fn();

			createHarnessSessionAction(send)(harness, "go", "/git/repo");

			expect(send).toHaveBeenCalledWith({
				type: "create",
				prompt: "go",
				cwd: "/git/repo",
				harness,
				auto: true,
			});
		},
	);
});

describe("createAssistSessionAction", () => {
	it("carries the launching card's id so the new session nests under it", () => {
		const send = vi.fn();

		createAssistSessionAction(send)(["review", "42"], "/git/repo", {
			title: "PR #42",
			inPlace: true,
			launchedFrom: "7",
		});

		expect(send).toHaveBeenCalledWith({
			type: "create-assist",
			assistArgs: ["review", "42"],
			cwd: "/git/repo",
			title: "PR #42",
			inPlace: true,
			launchedFrom: "7",
		});
	});

	it("sends no launcher when there is no launching card", () => {
		const send = vi.fn();

		createAssistSessionAction(send)(["review", "42"], "/git/repo", {
			title: "PR #42",
		});

		expect(send).toHaveBeenCalledWith({
			type: "create-assist",
			assistArgs: ["review", "42"],
			cwd: "/git/repo",
			title: "PR #42",
		});
	});
});

describe("dismissSessionAction", () => {
	it("keeps a refused dismiss subscribed so a restart redraws the pane", () => {
		const send = vi.fn();
		const { buffers, written, dispatch } = terminalState();

		dismissSessionAction(send, buffers)("5");
		restartSessionAction(send, buffers)("5");
		handleClear({ sessionId: "5" }, dispatch);
		handleOutput({ sessionId: "5", data: "resumed" }, dispatch);

		expect(send).toHaveBeenCalledWith({ type: "dismiss", sessionId: "5" });
		expect(written).toEqual(["\x1bc", "resumed"]);
	});

	it("stops writing once the pane unmounts", () => {
		const send = vi.fn();
		const { buffers, written, unsubscribe, dispatch } = terminalState();

		dismissSessionAction(send, buffers)("5");
		unsubscribe();
		handleOutput({ sessionId: "5", data: "resumed" }, dispatch);

		expect(written).toEqual([]);
	});
});

describe("outputAction", () => {
	it("asks for a fresh snapshot when a pane remounts over buffered output", () => {
		const send = vi.fn();
		const buffers = new Map([["5", "frames at an old width"]]);
		const handlers = new Map<string, (data: string) => void>();
		const written: string[] = [];
		outputAction(send, buffers, handlers)("5", (data) => written.push(data));
		const dispatch = {
			buffers: { current: buffers },
			handlers: { current: handlers },
		} as unknown as WsDispatch;

		handleSnapshot({ sessionId: "5", data: "current" }, dispatch);

		expect(send).toHaveBeenCalledWith({ type: "snapshot", sessionId: "5" });
		expect(written).toEqual(["frames at an old width", "\x1bccurrent"]);
		expect(buffers.get("5")).toBe("current");
	});

	it("waits for the daemon's replay when nothing is buffered", () => {
		const send = vi.fn();

		outputAction(send, new Map(), new Map())("5", vi.fn());

		expect(send).not.toHaveBeenCalled();
	});
});
