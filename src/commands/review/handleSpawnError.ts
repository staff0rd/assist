type SpawnErrorContext = {
	command: string;
	name: string;
	stderr: string;
	startedAt: number;
	quiet: boolean;
};

type SpawnErrorResult = {
	exitCode: number;
	stderr: string;
	elapsedMs: number;
};

function messageFor(err: NodeJS.ErrnoException, command: string): string {
	if (err.code === "ENOENT") return `command not found: ${command}`;
	return err.message || String(err);
}

export function handleSpawnError(
	ctx: SpawnErrorContext,
	err: NodeJS.ErrnoException,
): SpawnErrorResult {
	const message = messageFor(err, ctx.command);
	const stderr = ctx.stderr ? `${ctx.stderr}\n${message}` : message;
	if (!ctx.quiet) console.error(`[${ctx.name}] failed: ${message}`);
	return {
		exitCode: 127,
		stderr,
		elapsedMs: Date.now() - ctx.startedAt,
	};
}
