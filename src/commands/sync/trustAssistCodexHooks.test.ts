import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodexRpcError } from "./CodexRpcError";
import type { CodexHookEntry } from "./selectAssistCodexHooks";

const server = vi.hoisted(() => ({
	call: vi.fn(),
	close: vi.fn(),
	open: vi.fn(),
}));

vi.mock("./openCodexAppServer", () => ({
	openCodexAppServer: (...args: unknown[]) => server.open(...args),
}));

import { trustAssistCodexHooks } from "./trustAssistCodexHooks";

const CONFIG = "/home/u/.codex/config.toml";
const EXPECTED = new Map([
	["session_start:0:0", "assist codex-hook"],
	["stop:0:0", "assist codex-hook"],
]);

function hook(
	suffix: string,
	trustStatus: CodexHookEntry["trustStatus"],
	command = "assist codex-hook",
): CodexHookEntry {
	return {
		key: `${CONFIG}:${suffix}`,
		handlerType: "command",
		command,
		source: "user",
		sourcePath: CONFIG,
		pluginId: null,
		isManaged: false,
		currentHash: `sha256:${suffix}`,
		trustStatus,
	};
}

function listing(hooks: CodexHookEntry[]) {
	server.call.mockImplementation(async (method: string) =>
		method === "hooks/list"
			? { data: [{ cwd: "/", hooks, errors: [], warnings: [] }] }
			: { status: "ok" },
	);
}

function writes() {
	return server.call.mock.calls.filter(([m]) => m === "config/batchWrite");
}

describe("trustAssistCodexHooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		server.open.mockResolvedValue(server);
	});

	it("trusts each fresh Assist handler at its current hash, nothing else", async () => {
		listing([
			hook("session_start:0:0", "untrusted"),
			hook("stop:0:0", "untrusted"),
			hook("stop:1:0", "untrusted"),
		]);

		expect(await trustAssistCodexHooks(CONFIG, EXPECTED)).toBe(2);
		expect(server.open).toHaveBeenCalledWith("/home/u/.codex");
		expect(writes()).toEqual([
			[
				"config/batchWrite",
				{
					filePath: CONFIG,
					edits: [
						{
							keyPath: "hooks.state",
							mergeStrategy: "upsert",
							value: {
								[`${CONFIG}:session_start:0:0`]: {
									trusted_hash: "sha256:session_start:0:0",
								},
								[`${CONFIG}:stop:0:0`]: { trusted_hash: "sha256:stop:0:0" },
							},
						},
					],
				},
			],
		]);
		expect(server.close).toHaveBeenCalled();
	});

	it("writes nothing on an unchanged resync", async () => {
		listing([
			hook("session_start:0:0", "trusted"),
			hook("stop:0:0", "trusted"),
		]);

		expect(await trustAssistCodexHooks(CONFIG, EXPECTED)).toBe(0);
		expect(writes()).toEqual([]);
	});

	it("re-trusts only the updated Assist definition", async () => {
		listing([
			hook("session_start:0:0", "trusted"),
			hook("stop:0:0", "modified"),
			hook("stop:1:0", "modified"),
		]);

		expect(await trustAssistCodexHooks(CONFIG, EXPECTED)).toBe(1);
		expect(Object.keys(writes()[0][1].edits[0].value)).toEqual([
			`${CONFIG}:stop:0:0`,
		]);
	});

	it("refuses when a managed key no longer holds Assist's command", async () => {
		listing([
			hook("session_start:0:0", "untrusted"),
			hook("stop:0:0", "untrusted", "echo lookalike"),
		]);

		await expect(trustAssistCodexHooks(CONFIG, EXPECTED)).rejects.toThrow(
			/reported 1 of Assist's 2 hooks.*Review hooks/,
		);
		expect(writes()).toEqual([]);
	});

	it("explains how to upgrade a Codex without hooks/list", async () => {
		server.call.mockRejectedValue(
			new CodexRpcError("hooks/list", -32601, "method not found"),
		);

		await expect(trustAssistCodexHooks(CONFIG, EXPECTED)).rejects.toThrow(
			/codex update.*Review hooks/,
		);
		expect(server.close).toHaveBeenCalled();
	});

	it("reports a rejected trust write", async () => {
		listing([
			hook("session_start:0:0", "untrusted"),
			hook("stop:0:0", "untrusted"),
		]);
		const list = server.call.getMockImplementation();
		server.call.mockImplementation(async (method: string, params: unknown) => {
			if (method === "config/batchWrite")
				throw new CodexRpcError(method, -32000, "config is read-only");
			return list?.(method, params);
		});

		await expect(trustAssistCodexHooks(CONFIG, EXPECTED)).rejects.toThrow(
			/config\/batchWrite: config is read-only/,
		);
	});
});
