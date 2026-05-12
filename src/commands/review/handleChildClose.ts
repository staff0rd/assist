import { logChildClose } from "./logChildClose";

type CloseHandlerArgs = {
	code: number | null;
	startedAt: number;
	name: string;
	stderr: string;
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
		const elapsed = Math.round(elapsedMs / 1000);
		logChildClose(args.name, exitCode, elapsed, args.stderr);
	}
	return { exitCode, elapsedMs };
}
