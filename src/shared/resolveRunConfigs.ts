import { dirname, relative, resolve } from "node:path";
import { assertNoDuplicateRunNames } from "./assertNoDuplicateRunNames";
import { findLinkedConfigPath } from "./findLinkedConfigPath";
import { isRunLink } from "./isRunLink";
import { loadLinkedEntries } from "./loadLinkedEntries";
import type { RunConfig, RunEntry } from "./types";

type ResolveContext = {
	rootConfigDir: string;
	visited: Set<string>;
};

export function resolveRunConfigs(
	entries: RunEntry[] | undefined,
	configDir: string,
): RunConfig[] {
	const ctx: ResolveContext = { rootConfigDir: configDir, visited: new Set() };
	return resolveRecursive(entries, configDir, ctx);
}

function applyPrefix(configs: RunConfig[], prefix: string): RunConfig[] {
	return configs.map((c) => ({ ...c, name: `${prefix}:${c.name}` }));
}

function setDefaultCwd(configs: RunConfig[], defaultCwd: string): RunConfig[] {
	return configs.map((c) => (c.cwd ? c : { ...c, cwd: defaultCwd }));
}

function relativeToRoot(ctx: ResolveContext, absolute: string): string {
	return relative(ctx.rootConfigDir, absolute);
}

function loadAndResolveLink(
	linkPath: string,
	configDir: string,
	ctx: ResolveContext,
): RunConfig[] {
	const configPath = findLinkedConfigPath(linkPath, configDir);
	const entries = loadLinkedEntries(configPath, ctx.visited);
	const defaultCwd = relativeToRoot(ctx, resolve(configDir, linkPath));
	return setDefaultCwd(
		resolveRecursive(entries, dirname(configPath), ctx),
		defaultCwd,
	);
}

function resolveLink(
	entry: { link: string; prefix: string },
	configDir: string,
	ctx: ResolveContext,
): RunConfig[] {
	const configs = loadAndResolveLink(entry.link, configDir, ctx);
	return applyPrefix(configs, entry.prefix);
}

function resolveEntry(
	entry: RunEntry,
	configDir: string,
	ctx: ResolveContext,
): RunConfig[] {
	if (isRunLink(entry)) return resolveLink(entry, configDir, ctx);
	return [resolveLocalCwd(entry, configDir, ctx)];
}

function resolveRecursive(
	entries: RunEntry[] | undefined,
	configDir: string,
	ctx: ResolveContext,
): RunConfig[] {
	if (!entries || entries.length === 0) return [];
	const result = entries.flatMap((e) => resolveEntry(e, configDir, ctx));
	assertNoDuplicateRunNames(result);
	return result;
}

function resolveLocalCwd(
	config: RunConfig,
	configDir: string,
	ctx: ResolveContext,
): RunConfig {
	if (!config.cwd || configDir === ctx.rootConfigDir) return config;
	return {
		...config,
		cwd: relativeToRoot(ctx, resolve(configDir, config.cwd)),
	};
}
