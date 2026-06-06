import { describe, expect, it, vi } from "vitest";
import type { WebSocket } from "ws";
import { handleSocket } from "./handleSocket";
import type { SessionManager } from "./SessionManager";

function createWs() {
	const listeners = new Map<string, (msg: string) => void>();
	const ws = {
		OPEN: 1,
		readyState: 1,
		send: vi.fn(),
		on: (event: string, cb: (msg: string) => void) => {
			listeners.set(event, cb);
		},
	};
	return { ws: ws as unknown as WebSocket, listeners, send: ws.send };
}

function createManager(overrides: Partial<SessionManager>): SessionManager {
	return { addClient: vi.fn(), ...overrides } as unknown as SessionManager;
}

describe("handleSocket", () => {
	describe("when a message handler throws", () => {
		it("sends an error to the client", () => {
			const { ws, listeners, send } = createWs();
			const manager = createManager({
				spawnAssist: vi.fn(() => {
					throw new Error("posix_spawnp failed.");
				}),
			});

			handleSocket(ws, manager);
			listeners.get("message")?.(
				JSON.stringify({ type: "create-assist", assistArgs: ["next"] }),
			);

			expect(send).toHaveBeenCalledWith(
				JSON.stringify({
					type: "error",
					message: "create-assist failed: posix_spawnp failed.",
				}),
			);
		});
	});

	describe("when a message handler succeeds", () => {
		it("does not send an error", () => {
			const { ws, listeners, send } = createWs();
			const manager = createManager({
				spawnAssist: vi.fn(() => "1"),
			});

			handleSocket(ws, manager);
			listeners.get("message")?.(
				JSON.stringify({ type: "create-assist", assistArgs: ["next"] }),
			);

			const sent = send.mock.calls.map(([m]) => JSON.parse(m as string));
			expect(sent.some((m) => m.type === "error")).toBe(false);
		});
	});
});
