import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { restartWeb } from "./restartWeb";

function createReq(
	url: string,
	headers: IncomingMessage["headers"] = {},
): IncomingMessage {
	return { url, headers } as IncomingMessage;
}

function createRes() {
	const res = new EventEmitter() as unknown as ServerResponse;
	let statusCode = 0;
	res.writeHead = ((status: number) => {
		statusCode = status;
		return res;
	}) as ServerResponse["writeHead"];
	res.end = ((..._args: unknown[]) => {
		res.emit("finish");
		return res;
	}) as ServerResponse["end"];
	return { res, status: () => statusCode };
}

describe("restartWeb", () => {
	it("rejects a missing or invalid target without restarting anything", async () => {
		const restartDaemonFn = vi.fn(async () => {});
		const reExecFn = vi.fn();
		const { res, status } = createRes();

		await restartWeb(createReq("/api/restart"), res, {
			restartDaemonFn,
			reExecFn,
		});

		expect(status()).toBe(400);
		expect(restartDaemonFn).not.toHaveBeenCalled();
		expect(reExecFn).not.toHaveBeenCalled();
	});

	it("restarts only the daemon for target=daemon", async () => {
		const restartDaemonFn = vi.fn(async () => {});
		const reExecFn = vi.fn();
		const { res, status } = createRes();

		await restartWeb(createReq("/api/restart?target=daemon"), res, {
			restartDaemonFn,
			reExecFn,
		});

		expect(status()).toBe(200);
		expect(restartDaemonFn).toHaveBeenCalledOnce();
		expect(reExecFn).not.toHaveBeenCalled();
	});

	it("re-execs only the web server for target=webserver", async () => {
		const restartDaemonFn = vi.fn(async () => {});
		const reExecFn = vi.fn();
		const { res } = createRes();

		await restartWeb(createReq("/api/restart?target=webserver"), res, {
			restartDaemonFn,
			reExecFn,
		});

		expect(reExecFn).toHaveBeenCalledOnce();
		expect(restartDaemonFn).not.toHaveBeenCalled();
	});

	it("responds before restarting, daemon first then web server, for target=both", async () => {
		const order: string[] = [];
		const restartDaemonFn = vi.fn(async () => {
			order.push("daemon");
		});
		const reExecFn = vi.fn(() => order.push("reExec"));
		const { res } = createRes();
		res.on("finish", () => order.push("finish"));

		await restartWeb(createReq("/api/restart?target=both"), res, {
			restartDaemonFn,
			reExecFn,
		});

		expect(order).toEqual(["finish", "daemon", "reExec"]);
	});

	it("logs a forwarded restart with the viewer's node and trace id", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const { res } = createRes();

		await restartWeb(
			createReq("/api/restart?target=both", {
				"x-assist-linked-from": "wsl",
				"x-assist-trace-id": "7f3a1c2d",
			}),
			res,
			{ restartDaemonFn: async () => {}, reExecFn: () => {} },
		);

		expect(log).toHaveBeenCalledWith("restart both from=wsl trace=7f3a1c2d");
		log.mockRestore();
	});

	it("logs a re-exec that throws instead of failing silently", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const { res } = createRes();

		await restartWeb(createReq("/api/restart?target=both"), res, {
			restartDaemonFn: async () => {},
			reExecFn: () => {
				throw new Error("process.execve is not available on win32");
			},
		});

		expect(log).toHaveBeenCalledWith(
			"restart both failed: process.execve is not available on win32",
		);
		log.mockRestore();
	});
});
