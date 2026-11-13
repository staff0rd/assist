import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { autoConfirmHintCommand } from "./autoConfirmHintCommand";
import { syncSettings } from "./syncSettings";

const mockPromptConfirm = vi.fn();

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

describe("syncSettings", () => {
	let claudeDir: string;
	let targetBase: string;
	let logs: string[];

	beforeEach(() => {
		mockPromptConfirm.mockReset();
		mockPromptConfirm.mockResolvedValue(true);
		logs = [];
		vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
			logs.push(args.join(" "));
		});
		claudeDir = mkdtempSync(join(tmpdir(), "assist-sync-source-"));
		targetBase = mkdtempSync(join(tmpdir(), "assist-sync-target-"));
	});

	afterEach(() => {
		rmSync(claudeDir, { recursive: true, force: true });
		rmSync(targetBase, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	function writeSource(settings: unknown): void {
		writeFileSync(join(claudeDir, "settings.json"), JSON.stringify(settings));
	}

	function writeTarget(settings: unknown): void {
		writeFileSync(join(targetBase, "settings.json"), JSON.stringify(settings));
	}

	function readTarget(): Record<string, unknown> {
		return JSON.parse(readFileSync(join(targetBase, "settings.json"), "utf8"));
	}

	it("preserves enabledPlugins present only in home settings", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({
			permissions: { allow: ["Bash"] },
			enabledPlugins: { "my-plugin": true },
		});

		await syncSettings(claudeDir, targetBase, { yes: true });

		const result = readTarget();
		expect(result.enabledPlugins).toEqual({ "my-plugin": true });
		expect(result.permissions).toEqual({ allow: ["Bash", "Read"] });
	});

	it("preserves arbitrary marketplace keys absent from the repo source", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({
			extraKnownMarketplaces: { acme: { source: "acme/marketplace" } },
		});

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget().extraKnownMarketplaces).toEqual({
			acme: { source: "acme/marketplace" },
		});
	});

	it("does not prompt when the only difference is preserved user keys", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({
			permissions: { allow: ["Read"] },
			enabledPlugins: { "my-plugin": true },
		});

		await syncSettings(claudeDir, targetBase);

		expect(readTarget().enabledPlugins).toEqual({ "my-plugin": true });
	});

	it("overwrites a scalar only when the repo source ships that key", async () => {
		writeSource({ statusLine: { type: "command", command: "assist" } });
		writeTarget({
			statusLine: { type: "command", command: "mine", padding: 2 },
			autoMemoryEnabled: true,
		});

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget()).toEqual({
			statusLine: { type: "command", command: "assist", padding: 2 },
			autoMemoryEnabled: true,
		});
	});

	const assistHook = {
		matcher: "Bash",
		hooks: [{ type: "command", command: "assist cli-hook" }],
	};
	const assistSettings = {
		env: { ASSIST: "1" },
		hooks: { PreToolUse: [assistHook] },
		permissions: { allow: ["Skill(verify)"], deny: ["SendFeedback"] },
	};
	const userHook = {
		matcher: "Bash",
		hooks: [{ type: "command", command: "my-guard" }],
	};
	const userSettings = {
		env: { MINE: "x" },
		hooks: {
			PreToolUse: [userHook],
			PostToolUse: [
				{ matcher: "", hooks: [{ type: "command", command: "a" }] },
			],
			Stop: [{ matcher: "", hooks: [{ type: "command", command: "b" }] }],
		},
		permissions: {
			allow: ["Bash(ls:*)"],
			deny: ["Bash(rm:*)"],
			ask: ["Bash(git push:*)"],
			additionalDirectories: ["/work"],
			defaultMode: "acceptEdits",
		},
	};

	it("keeps user permissions, hooks under every event and env vars", async () => {
		writeSource(assistSettings);
		writeTarget(userSettings);

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget()).toEqual({
			env: { MINE: "x", ASSIST: "1" },
			hooks: {
				PreToolUse: [userHook, assistHook],
				PostToolUse: userSettings.hooks.PostToolUse,
				Stop: userSettings.hooks.Stop,
			},
			permissions: {
				allow: ["Bash(ls:*)", "Skill(verify)"],
				deny: ["Bash(rm:*)", "SendFeedback"],
				ask: ["Bash(git push:*)"],
				additionalDirectories: ["/work"],
				defaultMode: "acceptEdits",
			},
		});
	});

	it("is idempotent across repeated syncs", async () => {
		writeSource(assistSettings);
		writeTarget(userSettings);

		await syncSettings(claudeDir, targetBase, { yes: true });
		const first = readFileSync(join(targetBase, "settings.json"), "utf8");
		await syncSettings(claudeDir, targetBase);
		const second = readFileSync(join(targetBase, "settings.json"), "utf8");

		expect(second).toBe(first);
		expect(mockPromptConfirm).not.toHaveBeenCalled();
	});

	it("does not duplicate entries that differ only in key order", async () => {
		const reordered = {
			hooks: [{ command: "assist cli-hook", type: "command" }],
			matcher: "Bash",
		};
		writeSource({ hooks: { PreToolUse: [assistHook] } });
		writeTarget({ hooks: { PreToolUse: [reordered] } });

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget().hooks).toEqual({ PreToolUse: [reordered] });
	});

	it("replaces an assist hook entry whose matcher changed and keeps user hooks", async () => {
		const editHook = (matcher: string) => ({
			matcher,
			hooks: [{ type: "command", command: "assist edit-hook" }],
		});
		const userOwned = {
			matcher: "Edit",
			hooks: [{ type: "command", command: "my-formatter" }],
		};
		const current = editHook("Edit|Write|MultiEdit|NotebookEdit");
		writeSource({ hooks: { PreToolUse: [assistHook, current] } });
		writeTarget({
			hooks: {
				PreToolUse: [assistHook, editHook("Edit|Write|MultiEdit"), userOwned],
			},
		});

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget().hooks).toEqual({
			PreToolUse: [assistHook, userOwned, current],
		});
	});

	it("shows the merged result in the diff and keeps the file when declined", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({ permissions: { allow: ["Bash"] } });
		mockPromptConfirm.mockResolvedValue(false);

		await syncSettings(claudeDir, targetBase);

		expect(logged()).toContain('"Read"');
		expect(readTarget()).toEqual({ permissions: { allow: ["Bash"] } });
	});

	it("writes the source verbatim when no target exists", async () => {
		writeSource({ permissions: { allow: ["Read"] } });

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget()).toEqual({ permissions: { allow: ["Read"] } });
	});

	it("prints the sync.autoConfirm hint alongside the overwrite prompt", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({ permissions: { allow: ["Bash"] } });

		await syncSettings(claudeDir, targetBase);

		expect(mockPromptConfirm).toHaveBeenCalled();
		expect(logged()).toContain(autoConfirmHintCommand);
	});

	it("does not print the hint when overwriting without prompting", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({ permissions: { allow: ["Bash"] } });

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(mockPromptConfirm).not.toHaveBeenCalled();
		expect(logged()).not.toContain(autoConfirmHintCommand);
	});

	describe("preferences layer", () => {
		beforeEach(() => {
			writeSource({ permissions: { allow: ["Read"] } });
			writeFileSync(
				join(claudeDir, "preferences.json"),
				JSON.stringify({
					autoMemoryEnabled: false,
					env: { CLAUDE_AFK_TIMEOUT_MS: "1" },
					permissions: { deny: ["SendFeedback"] },
				}),
			);
			writeTarget({
				env: { USER_VAR: "x" },
				permissions: { allow: ["Bash"], deny: ["Write"] },
			});
		});

		it("is not applied by default", async () => {
			await syncSettings(claudeDir, targetBase, { yes: true });

			expect(readTarget()).toEqual({
				env: { USER_VAR: "x" },
				permissions: { allow: ["Bash", "Read"], deny: ["Write"] },
			});
		});

		it("is deep-merged after the required layer when enabled", async () => {
			await syncSettings(claudeDir, targetBase, {
				yes: true,
				preferences: true,
			});

			expect(readTarget()).toEqual({
				autoMemoryEnabled: false,
				env: { USER_VAR: "x", CLAUDE_AFK_TIMEOUT_MS: "1" },
				permissions: {
					allow: ["Bash", "Read"],
					deny: ["Write", "SendFeedback"],
				},
			});
		});
	});

	function logged(): string {
		return logs.join("\n");
	}
});
