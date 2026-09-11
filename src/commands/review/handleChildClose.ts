import { logChildClose } from "./logChildClose";

type CloseHandlerArgs = {
	code: number | null;
	startedAt: number;
	name: string;
	command: string;
	model?: string;
	stderr: string;
	stdout: string;
	quiet: boolean;
};

type CloseHandlerResult = {
	exitCode: number;
	elapsedMs: number;
};

export function handleChildClose(args: CloseHandlerArgs): CloseHandlerResult {
	const elapsedMs = Date.now() - args.startedAt;
	const exitCode = args.code ?? 0;
	if (!args.quiet) {
		logChildClose({
			name: args.name,
			command: args.command,
			model: args.model,
			exitCode,
			elapsedMs,
			stderr: args.stderr,
			stdout: args.stdout,
		});
	}
	return { exitCode, elapsedMs };
}
