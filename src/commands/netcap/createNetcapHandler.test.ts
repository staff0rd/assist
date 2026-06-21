import { mkdtempSync, readFileSync } from "node:fs";
import { type Server, createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createNetcapHandler } from "./createNetcapHandler";
import type { NetcapEntry } from "./types";

let server: Server;
let outPath: string;
let captured: NetcapEntry[];

function url(path = "/"): string {
	const { port } = server.address() as AddressInfo;
	return `http://127.0.0.1:${port}${path}`;
}

beforeEach(async () => {
	const dir = mkdtempSync(join(tmpdir(), "netcap-"));
	outPath = join(dir, "capture.jsonl");
	captured = [];
	const handler = createNetcapHandler({
		outPath,
		onCapture: (entry) => captured.push(entry),
	});
	server = createServer(handler);
	await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
});

afterEach(async () => {
	await new Promise<void>((done) => server.close(() => done()));
});

describe("createNetcapHandler", () => {
	describe("when a valid entry is POSTed", () => {
		it("should append it to the capture file", async () => {
			const entry = { url: "https://x.test/a", method: "GET", status: 200 };
			const res = await fetch(url(), {
				method: "POST",
				body: JSON.stringify(entry),
			});

			expect(res.status).toBe(200);
			expect(readFileSync(outPath, "utf8")).toBe(`${JSON.stringify(entry)}\n`);
			expect(captured).toEqual([entry]);
		});
	});

	describe("when multiple entries are POSTed", () => {
		it("should append each as its own line in arrival order", async () => {
			const first = { url: "https://x.test/1", method: "GET" };
			const second = { url: "https://x.test/2", method: "POST" };
			await fetch(url(), { method: "POST", body: JSON.stringify(first) });
			await fetch(url(), { method: "POST", body: JSON.stringify(second) });

			expect(readFileSync(outPath, "utf8")).toBe(
				`${JSON.stringify(first)}\n${JSON.stringify(second)}\n`,
			);
		});
	});

	describe("when the request is an OPTIONS preflight", () => {
		it("should respond 204 with permissive CORS", async () => {
			const res = await fetch(url(), { method: "OPTIONS" });

			expect(res.status).toBe(204);
			expect(res.headers.get("access-control-allow-origin")).toBe("*");
		});
	});

	describe("when the request is a GET ping", () => {
		it("should respond 200", async () => {
			const res = await fetch(url("/ping"));

			expect(res.status).toBe(200);
			expect(await res.text()).toBe("netcap receiver");
		});
	});

	describe("when the request method is unsupported", () => {
		it("should respond 405", async () => {
			const res = await fetch(url(), { method: "PUT" });

			expect(res.status).toBe(405);
		});
	});

	describe("when the POST body is not valid JSON", () => {
		it("should respond 400 and not append", async () => {
			const res = await fetch(url(), { method: "POST", body: "not json" });

			expect(res.status).toBe(400);
			expect(captured).toEqual([]);
		});
	});
});
