import type { AddressInfo } from "node:net";
import * as net from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WindowsConnection } from "./WindowsConnection";

const sink = { onLine: () => {}, onClose: () => {} };

describe("WindowsConnection circuit breaker", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("bounds launches after repeated failures and surfaces a clear error", async () => {
		const connect = vi.fn(() => Promise.reject(new Error("no daemon")));
		const conn = new WindowsConnection({ ...sink, connect });

		// Each of the first failures actually attempts a launch + connect.
		for (let i = 0; i < 3; i++)
			await expect(conn.ensure()).rejects.toThrow("no daemon");
		expect(connect).toHaveBeenCalledTimes(3);

		// Breaker tripped: further ensure() rejects immediately, no new launch.
		await expect(conn.ensure()).rejects.toThrow(/not retrying/);
		await expect(conn.ensure()).rejects.toThrow(/not retrying/);
		expect(connect).toHaveBeenCalledTimes(3);
	});

	it("resets the breaker once a connection succeeds", async () => {
		/* why: track server-side peers so teardown can destroy them — without a
		 * connection handler the accepted socket lingers and server.close() hangs */
		const peers: net.Socket[] = [];
		const server = net.createServer((s) => peers.push(s));
		await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
		const { port } = server.address() as AddressInfo;

		let failNext = true;
		const connect = vi.fn(() =>
			failNext
				? Promise.reject(new Error("no daemon"))
				: new Promise<net.Socket>((resolve, reject) => {
						const s = net.connect(port, "127.0.0.1");
						s.once("connect", () => resolve(s));
						s.once("error", reject);
					}),
		);
		const conn = new WindowsConnection({ ...sink, connect });

		// Two failures (one short of tripping), then a success clears the count.
		await expect(conn.ensure()).rejects.toThrow("no daemon");
		await expect(conn.ensure()).rejects.toThrow("no daemon");
		failNext = false;
		const socket = await conn.ensure();
		expect(connect).toHaveBeenCalledTimes(3);

		// After the reset it takes a fresh MAX failures to trip again: the next
		// three each attempt a launch rather than short-circuiting.
		socket.destroy();
		conn.dispose();
		failNext = true;
		for (let i = 0; i < 3; i++)
			await expect(conn.ensure()).rejects.toThrow("no daemon");
		expect(connect).toHaveBeenCalledTimes(6);

		// Now it is tripped again.
		await expect(conn.ensure()).rejects.toThrow(/not retrying/);
		expect(connect).toHaveBeenCalledTimes(6);

		for (const peer of peers) peer.destroy();
		await new Promise<void>((r) => server.close(() => r()));
	});
});
