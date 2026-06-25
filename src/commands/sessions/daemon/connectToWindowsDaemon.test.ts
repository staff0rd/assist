import type { AddressInfo } from "node:net";
import * as net from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const port = vi.fn(() => 0);
const host = vi.fn(() => "127.0.0.1");
vi.mock("./windowsDaemonPort", () => ({
	windowsDaemonPort: () => port(),
	windowsDaemonHost: () => host(),
}));

import { connectToWindowsDaemon } from "./connectToWindowsDaemon";

describe("connectToWindowsDaemon", () => {
	let server: net.Server;
	const peers: net.Socket[] = [];

	beforeEach(async () => {
		server = net.createServer((s) => peers.push(s));
		await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
		port.mockReturnValue((server.address() as AddressInfo).port);
	});

	afterEach(async () => {
		for (const peer of peers) peer.destroy();
		peers.length = 0;
		await new Promise<void>((r) => server.close(() => r()));
	});

	// why: WSL2's NAT drops an idle WSL->Windows socket; keepalive keeps it open
	it("enables TCP keepalive so an idle connection is not dropped", async () => {
		const spy = vi.spyOn(net.Socket.prototype, "setKeepAlive");
		const socket = await connectToWindowsDaemon();
		expect(spy).toHaveBeenCalledWith(true, expect.any(Number));
		socket.destroy();
		spy.mockRestore();
	});

	it("arms a connect timeout and clears it once connected", async () => {
		const spy = vi.spyOn(net.Socket.prototype, "setTimeout");
		const socket = await connectToWindowsDaemon();
		expect(spy.mock.calls[0]?.[0]).toBeGreaterThan(0);
		expect(spy).toHaveBeenCalledWith(0);
		socket.destroy();
		spy.mockRestore();
	});
});
