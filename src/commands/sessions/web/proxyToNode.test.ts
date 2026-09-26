import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { proxyToNode } from "./proxyToNode";

const links = vi.hoisted(() => ({
	current: [] as { name: string; url: string }[],
}));

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => ({ sessions: { links: links.current } }),
}));
vi.mock("../shared/resolveNodeName", () => ({
	resolveNodeName: () => "pc-wsl",
}));

type Seen = { url?: string; linkedFrom?: string; body: string };

let peer: Server;
let viewer: Server;
const seen: Seen[] = [];

function listen(server: Server): Promise<string> {
	return new Promise((resolve) =>
		server.listen(0, "127.0.0.1", () =>
			resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`),
		),
	);
}

function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
		});
		req.on("end", () => resolve(body));
	});
}

let viewerUrl = "";

beforeAll(async () => {
	peer = createServer(async (req, res) => {
		if (await proxyToNode(req, res)) return;
		seen.push({
			url: req.url,
			linkedFrom: req.headers["x-assist-linked-from"] as string | undefined,
			body: await readBody(req),
		});
		res.writeHead(201, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ served: "peer" }));
	});
	viewer = createServer(async (req, res) => {
		if (await proxyToNode(req, res)) return;
		res.writeHead(200);
		res.end("local");
	});
	links.current = [{ name: "pc-windows", url: await listen(peer) }];
	viewerUrl = await listen(viewer);
});

afterAll(() => {
	peer.close();
	viewer.close();
});

describe("proxyToNode", () => {
	it("forwards a ?node= request to that node without the node param", async () => {
		const res = await fetch(
			`${viewerUrl}/api/diff?cwd=C%3A%5Cgit%5Capp&node=pc-windows`,
			{ method: "POST", body: "payload" },
		);
		expect(res.status).toBe(201);
		expect(await res.json()).toEqual({ served: "peer" });
		expect(seen.at(-1)).toEqual({
			url: "/api/diff?cwd=C%3A%5Cgit%5Capp",
			linkedFrom: "pc-wsl",
			body: "payload",
		});
	});

	it("logs the same traceId on the viewer and the peer", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		await fetch(`${viewerUrl}/api/git-status?node=pc-windows`);
		await vi.waitFor(() => expect(log).toHaveBeenCalledTimes(2));
		const lines = log.mock.calls.map((call) => String(call[0]));
		log.mockRestore();
		const traces = lines.map((line) => line.match(/trace=(\w+)/)?.[1]);
		expect(traces[0]).toBeDefined();
		expect(traces[1]).toBe(traces[0]);
		expect(lines).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/^link pc-windows http: GET \/api\/git-status/),
				expect.stringMatching(/^link-from pc-wsl http: GET \/api\/git-status/),
			]),
		);
	});

	it("serves a request that already crossed a link locally", async () => {
		const res = await fetch(
			`${links.current[0].url}/api/diff?node=pc-windows`,
			{
				headers: { "x-assist-linked-from": "pc-wsl" },
			},
		);
		expect(res.status).toBe(201);
		expect(seen.at(-1)?.url).toBe("/api/diff?node=pc-windows");
	});

	it("serves requests without a node, or naming this node, locally", async () => {
		expect(await (await fetch(`${viewerUrl}/api/diff`)).text()).toBe("local");
		expect(
			await (await fetch(`${viewerUrl}/api/diff?node=pc-wsl`)).text(),
		).toBe("local");
	});

	it("responds 404 for a node with no link", async () => {
		const res = await fetch(`${viewerUrl}/api/diff?node=mac`);
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: "No link to node mac" });
	});
});
