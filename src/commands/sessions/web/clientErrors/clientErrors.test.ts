import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clientErrors } from "./clientErrors";

async function post(body: string) {
	const req = Readable.from([Buffer.from(body)]) as unknown as IncomingMessage;
	let status = 0;
	let text = "";
	const res = {
		writeHead: (code: number) => {
			status = code;
		},
		end: (chunk?: string) => {
			text = chunk ?? "";
		},
	} as unknown as ServerResponse;
	await clientErrors(req, res);
	return { status, body: JSON.parse(text) };
}

const failure = {
	at: "2026-10-31T01:02:03.000Z",
	method: "GET",
	path: "/api/new-session-defaults?node=mac",
	base: "https://home.ts.net:3100",
	node: "mac",
	error: "timed out after 30s",
	durationMs: 30012,
};

afterEach(() => vi.restoreAllMocks());

describe("clientErrors", () => {
	it("prints each reported failure as a client: line", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const { status, body } = await post(
			JSON.stringify({
				failures: [
					failure,
					{
						...failure,
						method: "POST",
						path: "/api/file",
						node: undefined,
						status: 500,
						error: "Internal Server Error",
						durationMs: 42,
					},
				],
			}),
		);
		expect(status).toBe(200);
		expect(body).toEqual({ received: 2 });
		expect(log.mock.calls.map(([line]) => line)).toEqual([
			"client: GET /api/new-session-defaults?node=mac -> node=mac via https://home.ts.net:3100 failed: timed out after 30s (30012ms) at 2026-10-31T01:02:03.000Z",
			"client: POST /api/file -> https://home.ts.net:3100 failed: HTTP 500 Internal Server Error (42ms) at 2026-10-31T01:02:03.000Z",
		]);
	});

	it("rejects a malformed body without logging", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		expect((await post("not json")).status).toBe(400);
		expect((await post(JSON.stringify({ failures: [{}] }))).status).toBe(400);
		expect(log).not.toHaveBeenCalled();
	});
});
