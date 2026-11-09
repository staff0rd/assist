import type { RunConfig } from "../../shared/types";

type RunEntryOptions = Pick<
	RunConfig,
	| "cwd"
	| "server"
	| "port"
	| "protocol"
	| "env"
	| "pre"
	| "filter"
	| "quiet"
	| "params"
>;

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
	if (options?.protocol) entry.protocol = options.protocol;
	if (options?.env) entry.env = options.env;
	if (options?.pre) entry.pre = options.pre;
	if (options?.filter) entry.filter = options.filter;
	if (options?.quiet) entry.quiet = true;
	if (options?.params) entry.params = options.params;
	return entry;
}
