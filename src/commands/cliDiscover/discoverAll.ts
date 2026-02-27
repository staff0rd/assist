import { isClaudeCode } from "../../lib/isClaudeCode";
import { mapAsync } from "./mapAsync";
import { hasSubcommands, parseCommands } from "./parseCommands";
import { runHelp } from "./runHelp";

type DiscoveredCommand = {
	path: string[];
	description: string;
};

type Progress = { done: number; total: number };

const SAFETY_DEPTH = 10;
const CONCURRENCY = 8;
const interactive = !isClaudeCode();

function showProgress(p: Progress, label: string): void {
	if (!interactive) return;
	const pct = Math.round((p.done / p.total) * 100);
	process.stderr.write(`\r\x1b[K[${pct}%] Scanning ${label}...`);
}

async function resolveCommand(
	cli: string,
	path: string[],
	description: string,
	depth: number,
	p: Progress,
): Promise<DiscoveredCommand[]> {
	showProgress(p, path.join(" "));
	const subHelp = await runHelp([cli, ...path]);
	if (!subHelp || !hasSubcommands(subHelp)) {
		return [{ path, description }];
	}
	const children = await discoverAt(cli, path, depth + 1, p);
	return children.length > 0 ? children : [{ path, description }];
}

async function discoverAt(
	cli: string,
	parentPath: string[],
	depth: number,
	p: Progress,
): Promise<DiscoveredCommand[]> {
	if (depth > SAFETY_DEPTH) return [];
	const helpText = await runHelp([cli, ...parentPath]);
	if (!helpText) return [];

	const cmds = parseCommands(helpText);
	const results = await mapAsync(cmds, CONCURRENCY, (cmd) =>
		resolveCommand(cli, [...parentPath, cmd.name], cmd.description, depth, p),
	);
	return results.flat();
}

export async function discoverAll(cli: string): Promise<DiscoveredCommand[]> {
	const topLevel = parseCommands(await runHelp([cli]));
	const p: Progress = { done: 0, total: topLevel.length };

	const results = await mapAsync(topLevel, CONCURRENCY, async (cmd) => {
		showProgress(p, cmd.name);
		const resolved = await resolveCommand(
			cli,
			[cmd.name],
			cmd.description,
			1,
			p,
		);
		p.done++;
		showProgress(p, cmd.name);
		return resolved;
	});

	if (interactive) process.stderr.write("\r\x1b[K");
	return results.flat();
}
