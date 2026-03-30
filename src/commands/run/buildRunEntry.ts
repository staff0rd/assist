type RunEntry = { name: string; command: string; args?: string[] };

export function buildRunEntry(
	name: string,
	command: string,
	args: string[],
): RunEntry {
	const effectiveArgs =
		args.length === 0 && command.includes(" ")
			? command.split(/\s+/).slice(1)
			: args;
	const effectiveCommand =
		args.length === 0 && command.includes(" ")
			? command.split(/\s+/)[0]
			: command;

	const entry: RunEntry = { name, command: effectiveCommand };
	if (effectiveArgs.length > 0) entry.args = effectiveArgs;
	return entry;
}
