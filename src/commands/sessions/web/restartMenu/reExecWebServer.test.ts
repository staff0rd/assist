import { describe, expect, it, vi } from "vitest";
import { reExecWebServer } from "./reExecWebServer";

describe("reExecWebServer", () => {
	it("spawns a detached copy inheriting the TTY, then exits the old process", () => {
		const order: string[] = [];
		const child = { unref: vi.fn(() => order.push("unref")) };
		const spawnFn = vi.fn(() => {
			order.push("spawn");
			return child;
		});
		const beforeExec = vi.fn(() => order.push("beforeExec"));
		const exit = vi.fn(() => order.push("exit"));

		reExecWebServer({ beforeExec, spawnFn, exit });

		expect(spawnFn).toHaveBeenCalledWith(
			process.execPath,
			process.argv.slice(1),
			expect.objectContaining({ stdio: "inherit", detached: true }),
		);
		expect(child.unref).toHaveBeenCalledOnce();
		expect(exit).toHaveBeenCalledWith(0);
		expect(order).toEqual(["beforeExec", "spawn", "unref", "exit"]);
	});
});
