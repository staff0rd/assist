import type { Socket } from "node:net";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { handleConnection } from "./handleConnection";
import type { SessionManager } from "./SessionManager";

function createSocket() {
	const socket = new PassThrough();
	const write = vi.fn();
	Object.assign(socket, { write });
	return { socket: socket as unknown as Socket, feed: socket, write };
}

function createManager(overrides: Partial<SessionManager>): SessionManager {
	return {
		addClient: vi.fn(),
		removeClient: vi.fn(),
		windowsProxy: { route: vi.fn(() => false) },
		...overrides,
	} as unknown as SessionManager;
}

function flush(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve));
}

describe("handleConnection", () => {
	it("registers the connection as a client", () => {
		const { socket } = createSocket();
		const manager = createManager({});

		handleConnection(socket, manager);

		expect(manager.addClient).toHaveBeenCalledOnce();
	});

	describe("when a message handler throws", () => {
		it("sends an error to the client", async () => {
			const { socket, feed, write } = createSocket();
			const manager = createManager({
				spawnAssist: vi.fn(() => {
					throw new Error("posix_spawnp failed.");
				}),
			});

			handleConnection(socket, manager);
			feed.push(
				`${JSON.stringify({ type: "create-assist", assistArgs: ["next"] })}\n`,
			);
			await flush();

			expect(write).toHaveBeenCalledWith(
				`${JSON.stringify({
					type: "error",
					message: "create-assist failed: posix_spawnp failed.",
				})}\n`,
			);
		});
	});

	describe("when a message handler succeeds", () => {
		it("does not send an error", async () => {
			const { socket, feed, write } = createSocket();
			const manager = createManager({ spawnAssist: vi.fn(() => "1") });

			handleConnection(socket, manager);
			feed.push(
				`${JSON.stringify({ type: "create-assist", assistArgs: ["next"] })}\n`,
			);
			await flush();

			const sent = write.mock.calls.map(([m]) => JSON.parse(m as string));
			expect(sent.some((m) => m.type === "error")).toBe(false);
		});
	});

	it("survives an abrupt disconnect (ECONNRESET)", async () => {
		const { socket, feed } = createSocket();
		const manager = createManager({});

		handleConnection(socket, manager);
		feed.destroy(new Error("read ECONNRESET"));
		await flush();

		expect(manager.removeClient).toHaveBeenCalledOnce();
	});

	it("removes the client when the connection closes", async () => {
		const { socket, feed } = createSocket();
		const manager = createManager({});

		handleConnection(socket, manager);
		feed.end();
		await flush();

		expect(manager.removeClient).toHaveBeenCalledOnce();
	});
});
