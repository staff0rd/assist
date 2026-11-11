import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { harnesses } from "../harnesses";

vi.unmock("./codexHookProbe");

import { codexHookProbe } from "./codexHookProbe";

const originalHome = harnesses.codex.homeDir;
let home: string;
let tick = 0;

const block = (state: string) => `model = "gpt"

# >>> assist codex hooks (managed) — do not edit >>>
[[hooks.SessionStart]]
[[hooks.SessionStart.hooks]]
type = "command"
command = "assist codex-hook"

[[hooks.PreToolUse]]
[[hooks.PreToolUse.hooks]]
type = "command"
command = "assist codex-hook"
${state}
# <<< assist codex hooks (managed) <<<
`;

const trusted = (key: string, extra = "") =>
	`[hooks.state.${JSON.stringify(`${join(home, "config.toml")}:${key}`)}]\ntrusted_hash = "sha256:abc"\n${extra}`;

function writeConfig(content: string) {
	tick++;
	writeFileSync(join(home, "config.toml"), `${content}\n${"#".repeat(tick)}\n`);
}

describe("codexHookProbe", () => {
	beforeEach(() => {
		home = mkdtempSync(join(tmpdir(), "codex-probe-"));
		harnesses.codex.homeDir = home;
	});

	afterEach(() => {
		harnesses.codex.homeDir = originalHome;
	});

	it("is unsupported when Codex has no config", () => {
		expect(codexHookProbe()).toMatchObject({
			supported: false,
			reason: expect.stringContaining("not installed"),
			remediation: expect.stringContaining("assist sync"),
		});
	});

	it("is unsupported when the managed hook block is missing", () => {
		writeConfig(`model = "gpt"\n${trusted("pre_tool_use:0:0")}`);
		expect(codexHookProbe()).toMatchObject({
			supported: false,
			reason: expect.stringContaining("not installed"),
		});
	});

	it("is unsupported when the PreToolUse hook is not trusted", () => {
		writeConfig(block(trusted("session_start:0:0")));
		expect(codexHookProbe()).toMatchObject({
			supported: false,
			reason: expect.stringContaining("not trusted"),
			remediation: expect.stringContaining("assist sync"),
		});
	});

	it("is unsupported when the trusted hook is disabled", () => {
		writeConfig(block(trusted("pre_tool_use:0:0", "enabled = false\n")));
		expect(codexHookProbe()).toMatchObject({
			supported: false,
			reason: expect.stringContaining("not trusted"),
		});
	});

	it("is supported when the PreToolUse hook is installed and trusted", () => {
		writeConfig(block(trusted("pre_tool_use:0:0")));
		expect(codexHookProbe()).toEqual({ supported: true });
	});

	it("keys trust on the hook's position after user hooks", () => {
		const user = `[[hooks.PreToolUse]]\n[[hooks.PreToolUse.hooks]]\ntype = "command"\ncommand = "my-hook"\n`;
		writeConfig(`${user}\n${block(trusted("pre_tool_use:0:0"))}`);
		expect(codexHookProbe().supported).toBe(false);
		writeConfig(`${user}\n${block(trusted("pre_tool_use:1:0"))}`);
		expect(codexHookProbe()).toEqual({ supported: true });
	});

	it("ignores trust recorded for another config file", () => {
		writeConfig(
			block(
				`[hooks.state."/elsewhere/config.toml:pre_tool_use:0:0"]\ntrusted_hash = "sha256:abc"\n`,
			),
		);
		expect(codexHookProbe().supported).toBe(false);
	});
});
