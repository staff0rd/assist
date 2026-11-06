import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runHandler } from "./runHandler";

let server: Server | undefined;

afterEach(() => {
	server?.close();
	server = undefined;
	vi.restoreAllMocks();
});

async function serve(
	handler: Parameters<typeof runHandler>[0],
): Promise<string> {
	server = createServer((req, res) => runHandler(handler, req, res, 0));
	await new Promise<void>((resolve) => server?.listen(0, resolve));
	return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe("runHandler", () => {
	it("responds 500 with the thrown error's message", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const url = await serve(async () => {
			throw new Error("Unrecognized key: testflight");
		});

		const res = await fetch(`${url}/api/updates`);

		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({
			error: "Unrecognized key: testflight",
		});
	});
});
