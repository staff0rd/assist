import { afterEach, describe, expect, it, vi } from "vitest";
import { reExecWebServer } from "./reExecWebServer";

describe("reExecWebServer", () => {
	const originalArgv = process.argv;

	afterEach(() => {
		process.argv = originalArgv;
	});

	it("restores the terminal then replaces the process image in place", () => {
		const order: string[] = [];
		const beforeExec = vi.fn(() => order.push("beforeExec"));
		const execveFn = vi.fn(() => order.push("execve"));
		const spawnSyncFn = vi.fn(() => {
			order.push("spawnSync");
			return { status: 0 };
		});
		const exit = vi.fn(() => order.push("exit"));

		reExecWebServer({ beforeExec, execveFn, spawnSyncFn, exit });

		expect(execveFn).toHaveBeenCalledWith(
			process.execPath,
			[...process.argv, "--no-open"],
			process.env,
		);
		expect(spawnSyncFn).not.toHaveBeenCalled();
		expect(exit).not.toHaveBeenCalled();
		expect(order).toEqual(["beforeExec", "execve"]);
	});

	it("falls back to a blocking attached child when execve is unavailable", () => {
		const order: string[] = [];
		const beforeExec = vi.fn(() => order.push("beforeExec"));
		const spawnSyncFn = vi.fn(() => {
			order.push("spawnSync");
			return { status: 0 };
		});
		const exit = vi.fn(() => order.push("exit"));

		reExecWebServer({ beforeExec, execveFn: null, spawnSyncFn, exit });

		expect(spawnSyncFn).toHaveBeenCalledWith(
			process.execPath,
			[...process.argv.slice(1), "--no-open"],
			expect.objectContaining({ stdio: "inherit" }),
		);
		expect(exit).toHaveBeenCalledWith(0);
		expect(order).toEqual(["beforeExec", "spawnSync", "exit"]);
	});

	it("propagates the child exit code in the fallback path", () => {
		const spawnSyncFn = vi.fn(() => ({ status: 3 }));
		const exit = vi.fn();

		reExecWebServer({ execveFn: null, spawnSyncFn, exit });

		expect(exit).toHaveBeenCalledWith(3);
	});

	it("appends --no-open to the re-exec argv", () => {
		process.argv = ["node", "/path/assist", "sessions", "web"];
		const execveFn = vi.fn();

		reExecWebServer({ execveFn });

		expect(execveFn).toHaveBeenCalledWith(
			process.execPath,
			["node", "/path/assist", "sessions", "web", "--no-open"],
			process.env,
		);
	});

	it("does not duplicate --no-open when it is already present", () => {
		process.argv = ["node", "/path/assist", "sessions", "web", "--no-open"];
		const execveFn = vi.fn();

		reExecWebServer({ execveFn });

		expect(execveFn).toHaveBeenCalledWith(
			process.execPath,
			["node", "/path/assist", "sessions", "web", "--no-open"],
			process.env,
		);
	});
});
