import { afterEach, describe, expect, it, vi } from "vitest";
import { reExecOnDeclaredNode } from "./reExecOnDeclaredNode";

const target = "/opt/node-24/bin/node";
const declared = {
	spec: "24",
	ok: true as const,
	node: { path: target, binDir: "/opt/node-24/bin", version: "24.22.1" },
};

describe("reExecOnDeclaredNode", () => {
	afterEach(() => vi.unstubAllEnvs());

	it("re-execs the same argv on the declared node", () => {
		const execveFn = vi.fn();
		const log = vi.fn();

		reExecOnDeclaredNode({ declared, log, execveFn });

		expect(execveFn).toHaveBeenCalledWith(
			target,
			[target, ...process.argv.slice(1)],
			expect.objectContaining({ ASSIST_NODE_REEXEC: target }),
		);
		expect(log.mock.calls[0][0]).toContain("re-executing on node v24.22.1");
	});

	it("does not loop when a re-exec onto the target already happened", () => {
		vi.stubEnv("ASSIST_NODE_REEXEC", target);
		const execveFn = vi.fn();

		reExecOnDeclaredNode({ declared, log: vi.fn(), execveFn });

		expect(execveFn).not.toHaveBeenCalled();
	});

	it("stays on the running node when it is the declared one", () => {
		const execveFn = vi.fn();
		const log = vi.fn();

		reExecOnDeclaredNode({
			declared: {
				...declared,
				node: { ...declared.node, path: process.execPath },
			},
			log,
			execveFn,
		});

		expect(execveFn).not.toHaveBeenCalled();
		expect(log).not.toHaveBeenCalled();
	});

	it("names the setting and version when it cannot be resolved, then falls back", () => {
		const execveFn = vi.fn();
		const log = vi.fn();

		reExecOnDeclaredNode({
			declared: {
				spec: "26",
				ok: false,
				error: "no installed node satisfies it",
			},
			log,
			execveFn,
		});

		expect(execveFn).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith(
			expect.stringMatching(
				/^sessions\.nodeVersion "26" could not be resolved: no installed node satisfies it; falling back to the current node v/,
			),
		);
	});
});
