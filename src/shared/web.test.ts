import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openBrowser } from "../lib/openBrowser";
import { startWebServer } from "./web";

vi.mock("../lib/openBrowser", () => ({ openBrowser: vi.fn() }));

const openBrowserMock = openBrowser as unknown as ReturnType<typeof vi.fn>;

describe("startWebServer", () => {
	let servers: Server[] = [];

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		for (const server of servers) {
			server.close();
		}
		servers = [];
		vi.clearAllMocks();
	});

	function start(open?: boolean): Promise<void> {
		return new Promise((resolve) => {
			const server = startWebServer("Test", 0, async () => {}, undefined, open);
			servers.push(server);
			server.on("listening", () => resolve());
		});
	}

	function startWith(
		handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
	): Promise<number> {
		return new Promise((resolve) => {
			const server = startWebServer(
				"Test",
				0,
				async (req, res) => handler(req, res),
				undefined,
				false,
			);
			servers.push(server);
			server.on("listening", () =>
				resolve((server.address() as AddressInfo).port),
			);
		});
	}

	function get(port: number): Promise<number> {
		return fetch(`http://localhost:${port}/api/items`).then((r) => r.status);
	}

	function requestLogLines(): string[] {
		const logMock = console.log as unknown as ReturnType<typeof vi.fn>;
		return logMock.mock.calls
			.map((call) => String(call[0]))
			.filter((line) => / \d+ms/.test(line));
	}

	// why: the server's 'finish' handler logs after the client's fetch resolves, so give the event loop a turn before inspecting captured log lines.
	function settle(): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, 50));
	}

	it("opens a browser when open is not specified", async () => {
		await start();
		expect(openBrowserMock).toHaveBeenCalledTimes(1);
	});

	it("opens a browser when open is true", async () => {
		await start(true);
		expect(openBrowserMock).toHaveBeenCalledTimes(1);
	});

	it("does not open a browser when open is false", async () => {
		await start(false);
		expect(openBrowserMock).not.toHaveBeenCalled();
	});

	it("responds 500 when the handler rejects instead of hanging", async () => {
		const port = await startWith(async () => {
			throw new Error("boom");
		});
		expect(await get(port)).toBe(500);
	});

	it("does not log fast requests by default", async () => {
		const port = await startWith(async (_req, res) => {
			res.writeHead(200);
			res.end();
		});
		expect(await get(port)).toBe(200);
		await settle();
		expect(requestLogLines()).toHaveLength(0);
	});

	it("logs every request when ASSIST_WEB_LOG is set", async () => {
		vi.stubEnv("ASSIST_WEB_LOG", "1");
		const port = await startWith(async (_req, res) => {
			res.writeHead(200);
			res.end();
		});
		expect(await get(port)).toBe(200);
		await settle();
		const lines = requestLogLines();
		expect(lines).toHaveLength(1);
		expect(lines[0]).toContain("GET /api/items 200");
		vi.unstubAllEnvs();
	});
});
