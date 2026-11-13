import { EventEmitter } from "node:events";
import type { PoolClient } from "pg";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPool } from "./createPool";

vi.mock("../loadConfig", () => ({
	loadConfig: vi.fn(() => ({ database: {} })),
}));

function fakeClient(): PoolClient {
	return new EventEmitter() as unknown as PoolClient;
}

describe("createPool", () => {
	let consoleError: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		process.env.ASSIST_DATABASE_URL = "postgres://user:pass@host:5432/db";
		consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleError.mockRestore();
		delete process.env.ASSIST_DATABASE_URL;
	});

	it("logs a socket error on a checked-out client instead of throwing", () => {
		const pool = createPool();
		const client = fakeClient();
		pool.emit("acquire", client);

		expect(() =>
			client.emit("error", new Error("read ETIMEDOUT")),
		).not.toThrow();
		expect(consoleError).toHaveBeenCalledWith(
			expect.stringContaining("backlog client error: read ETIMEDOUT"),
		);
	});

	it("stops listening on a client once it is released back to the pool", () => {
		const pool = createPool();
		const client = fakeClient();
		pool.emit("acquire", client);
		pool.emit("release", undefined, client);

		expect(client.listenerCount("error")).toBe(0);
	});

	it("still logs idle-client errors emitted by the pool", () => {
		const pool = createPool();

		expect(() => pool.emit("error", new Error("terminated"))).not.toThrow();
		expect(consoleError).toHaveBeenCalledWith(
			expect.stringContaining("backlog pool error: terminated"),
		);
	});
});
