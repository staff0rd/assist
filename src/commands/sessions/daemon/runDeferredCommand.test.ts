import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { runDeferredCommand } from "./runDeferredCommand";

function fakeChild() {
	const child = Object.assign(new EventEmitter(), {
		pid: 42,
		stdout: new PassThrough(),
		stderr: new PassThrough(),
		stdin: new PassThrough(),
	});
	return child;
}

describe("runDeferredCommand", () => {
	it("runs assist with the command's argv, cwd, env and stdin, marked as the deferred run", async () => {
		const child = fakeChild();
		const spawn = vi.fn(() => child);
		let stdin = "";
		child.stdin.on("data", (chunk) => {
			stdin += chunk;
		});

		const pid = runDeferredCommand(
			{
				argv: ["ask", "--body", "-"],
				stdin: "# Plan",
				cwd: "/repo",
				env: { ASSIST_SESSION_ID: "7" },
			},
			vi.fn(),
			spawn as never,
		);

		expect(pid).toBe(42);
		expect(spawn).toHaveBeenCalledWith(
			process.execPath,
			[process.argv[1], "ask", "--body", "-"],
			expect.objectContaining({
				cwd: "/repo",
				env: { ASSIST_SESSION_ID: "7", ASSIST_DEFERRED_RUN: "1" },
			}),
		);
		await new Promise((resolve) => setImmediate(resolve));
		expect(stdin).toBe("# Plan");
	});

	it("reports the combined output and exit code when the command closes", async () => {
		const child = fakeChild();
		const onDone = vi.fn();
		runDeferredCommand(
			{ argv: ["ask"], cwd: "/repo", env: {} },
			onDone,
			(() => child) as never,
		);

		child.stdout.write("Approved.\n");
		child.stderr.write("note\n");
		await new Promise((resolve) => setImmediate(resolve));
		child.emit("close", 1);

		expect(onDone).toHaveBeenCalledWith({
			output: "Approved.\nnote\n",
			exitCode: 1,
		});
	});
});
