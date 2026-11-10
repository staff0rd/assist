import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ home: "", spawnSync: vi.fn() }));

vi.mock("node:child_process", () => ({
	spawnSync: (...args: unknown[]) => state.spawnSync(...args),
}));

vi.mock("./harnesses", () => ({
	harnesses: {
		codex: {
			get homeDir() {
				return state.home;
			},
		},
	},
}));

vi.unmock("./prepareCodexHookTrust");

import { MANAGED_BLOCK_BEGIN } from "../commands/sync/upsertManagedBlock";
import { prepareCodexHookTrust } from "./prepareCodexHookTrust";

const BLOCK = `${MANAGED_BLOCK_BEGIN}\n[[hooks.Stop]]\n`;

describe("prepareCodexHookTrust", () => {
	let config: string;

	beforeEach(() => {
		state.home = mkdtempSync(join(tmpdir(), "codex-home-"));
		config = join(state.home, "config.toml");
		state.spawnSync.mockReset().mockReturnValue({ status: 0, stderr: "" });
	});

	afterEach(() => rmSync(state.home, { recursive: true, force: true }));

	it("leaves a Codex without Assist's hooks alone", () => {
		expect(prepareCodexHookTrust()).toBeUndefined();
		writeFileSync(config, '[[hooks.Stop]]\ncommand = "assist codex-hook"\n');
		expect(prepareCodexHookTrust()).toBeUndefined();

		expect(state.spawnSync).not.toHaveBeenCalled();
	});

	it("runs the selective trust command, never a bypass, when Assist's hooks are installed", () => {
		writeFileSync(config, BLOCK);

		expect(prepareCodexHookTrust()).toBeUndefined();

		expect(state.spawnSync).toHaveBeenCalledTimes(1);
		const [file, args] = state.spawnSync.mock.calls[0];
		expect(file).toBe(process.execPath);
		expect(args).toEqual([process.argv[1], "codex-hook-trust"]);
	});

	it("skips the check while config.toml is unchanged, and repeats it once it changes", () => {
		writeFileSync(config, BLOCK);
		prepareCodexHookTrust();
		prepareCodexHookTrust();
		expect(state.spawnSync).toHaveBeenCalledTimes(1);

		writeFileSync(config, `[[hooks.Stop]]\n\n${BLOCK}`);
		prepareCodexHookTrust();

		expect(state.spawnSync).toHaveBeenCalledTimes(2);
	});

	it("returns the trust command's explanation and retries on the next launch", () => {
		writeFileSync(config, `${BLOCK}# failing\n`);
		state.spawnSync.mockReturnValue({
			status: 1,
			stderr: "Could not trust Assist's Codex hooks: read-only.\n",
		});

		expect(prepareCodexHookTrust()).toBe(
			"Could not trust Assist's Codex hooks: read-only.",
		);
		prepareCodexHookTrust();

		expect(state.spawnSync).toHaveBeenCalledTimes(2);
	});

	it("explains a trust command that could not run", () => {
		writeFileSync(config, `${BLOCK}# timing out\n`);
		state.spawnSync.mockReturnValue({
			status: null,
			stderr: "",
			error: new Error("spawnSync ETIMEDOUT"),
		});

		expect(prepareCodexHookTrust()).toMatch(
			/spawnSync ETIMEDOUT.*choose Review hooks/,
		);
	});
});
