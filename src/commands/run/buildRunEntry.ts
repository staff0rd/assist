import type { RunConfig } from "../../shared/types";

type RunEntryOptions = Pick<RunConfig, "cwd" | "server" | "port">;

export function buildRunEntry(
	name: string,
	command: string,
	args: string[],
	options?: RunEntryOptions,
): RunConfig {
	const effectiveArgs =
		args.length === 0 && command.includes(" ")
			? command.split(/\s+/).slice(1)
			: args;
	const effectiveCommand =
		args.length === 0 && command.includes(" ")
			? command.split(/\s+/)[0]
			: command;

	const entry: RunConfig = { name, command: effectiveCommand };
	if (effectiveArgs.length > 0) entry.args = effectiveArgs;
	if (options?.cwd) entry.cwd = options.cwd;
	if (options?.server !== undefined) entry.server = options.server;
	if (options?.port !== undefined) entry.port = options.port;
	return entry;
}
