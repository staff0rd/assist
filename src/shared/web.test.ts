import type { Server } from "node:http";
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
});
