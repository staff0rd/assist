import * as fs from "node:fs";
import * as path from "node:path";
import { assistCodexHookKeys } from "../../commands/sync/assistCodexHookKeys";
import {
	MANAGED_BLOCK_BEGIN,
	MANAGED_BLOCK_END,
} from "../../commands/sync/upsertManagedBlock";
import { harnesses } from "../harnesses";
import type { CapabilityStatus } from "./types";
import { supported, unsupported } from "./unsupported";
import { codexTrustedHookKeys } from "./codexTrustedHookKeys";

const HOOK_COMMAND = "assist codex-hook";
const INTERCEPT_EVENT = "pre_tool_use:";
const notInstalled = unsupported(
	"assist's codex-hook is not installed in ~/.codex/config.toml, so Codex tool calls and file patches would bypass the allowlist, restricted paths and docs/schema locks",
	"run `assist sync` to install and trust the hook, or pick another harness",
);

const notTrusted = unsupported(
	"assist's codex-hook is installed but not trusted (or disabled) in Codex, so Codex skips it and tool calls and file patches would bypass the allowlist, restricted paths and docs/schema locks",
	"run `assist sync` to trust the hook (or trust the `assist codex-hook` entries from Codex's hook review), or pick another harness",
);

let cached: { fingerprint: string; status: CapabilityStatus } | undefined;

function interceptKeys(config: string): string[] {
	const begin = config.indexOf(MANAGED_BLOCK_BEGIN);
	if (begin === -1) return [];
	const end = config.indexOf(MANAGED_BLOCK_END, begin);
	const block = config.slice(
		begin + MANAGED_BLOCK_BEGIN.length,
		end === -1 ? config.length : end,
	);
	return [...assistCodexHookKeys(config.slice(0, begin), block)]
		.filter(
			([key, command]) =>
				key.startsWith(INTERCEPT_EVENT) && command === HOOK_COMMAND,
		)
		.map(([key]) => key);
}

function probe(config: string, configPath: string): CapabilityStatus {
	const keys = interceptKeys(config);
	if (!keys.length) return notInstalled;
	const trusted = codexTrustedHookKeys(config, configPath);
	return keys.every((key) => trusted.has(key)) ? supported : notTrusted;
}

export function codexHookProbe(): CapabilityStatus {
	const configPath = path.join(harnesses.codex.homeDir, "config.toml");
	let stat: fs.Stats;
	try {
		stat = fs.statSync(configPath);
	} catch {
		return notInstalled;
	}
	const fingerprint = `${configPath}:${stat.mtimeMs}:${stat.size}`;
	if (cached?.fingerprint === fingerprint) return cached.status;
	const status = probe(fs.readFileSync(configPath, "utf8"), configPath);
	cached = { fingerprint, status };
	return status;
}
