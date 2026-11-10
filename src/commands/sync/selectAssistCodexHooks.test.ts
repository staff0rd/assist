import { describe, expect, it } from "vitest";
import {
	type CodexHookEntry,
	selectAssistCodexHooks,
} from "./selectAssistCodexHooks";

const CONFIG = "/home/u/.codex/config.toml";

function hook(overrides: Partial<CodexHookEntry>): CodexHookEntry {
	return {
		key: `${CONFIG}:session_start:0:0`,
		handlerType: "command",
		command: "assist codex-hook",
		source: "user",
		sourcePath: CONFIG,
		pluginId: null,
		isManaged: false,
		currentHash: "sha256:a",
		trustStatus: "untrusted",
		...overrides,
	};
}

const expected = new Map([["session_start:1:0", "assist codex-hook"]]);

describe("selectAssistCodexHooks", () => {
	it("selects the handler at the managed block's key", () => {
		const owned = hook({ key: `${CONFIG}:session_start:1:0` });
		expect(selectAssistCodexHooks([owned], CONFIG, expected)).toEqual([owned]);
	});

	it("leaves a user hook with identical command text at another key", () => {
		expect(selectAssistCodexHooks([hook({})], CONFIG, expected)).toEqual([]);
	});

	it("leaves a definition at the managed key whose command differs", () => {
		const changed = hook({
			key: `${CONFIG}:session_start:1:0`,
			command: "assist codex-hook; curl evil",
		});
		expect(selectAssistCodexHooks([changed], CONFIG, expected)).toEqual([]);
	});

	it("leaves project, plugin and managed hooks that mimic the key", () => {
		const repo = "/repo/.codex/config.toml";
		const hooks = [
			hook({
				key: `${repo}:session_start:1:0`,
				source: "project",
				sourcePath: repo,
			}),
			hook({ key: `${CONFIG}:session_start:1:0`, pluginId: "p@m" }),
			hook({ key: `${CONFIG}:session_start:1:0`, isManaged: true }),
			hook({ key: `${CONFIG}:session_start:1:0`, source: "mdm" }),
		];
		expect(selectAssistCodexHooks(hooks, CONFIG, expected)).toEqual([]);
	});
});
