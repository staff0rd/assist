import { describe, expect, it, vi } from "vitest";
import { reExecWebServer } from "./reExecWebServer";

describe("reExecWebServer", () => {
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
			process.argv,
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
			process.argv.slice(1),
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
});
