import { formatReviewerFailure } from "./formatReviewerFailure";

type LogArgs = {
	name: string;
	command: string;
	exitCode: number;
	elapsedMs: number;
	stderr: string;
	stdout: string;
};

export function logChildClose(args: LogArgs): void {
	const elapsedSeconds = Math.round(args.elapsedMs / 1000);
	if (args.exitCode === 0) {
		console.log(`[${args.name}] done in ${elapsedSeconds}s`);
		return;
	}
	const diagnostic = formatReviewerFailure({
		name: args.name,
		command: args.command,
		exitCode: args.exitCode,
		stderr: args.stderr,
		stdout: args.stdout,
		elapsedMs: args.elapsedMs,
	});
	console.error(`[${args.name}] ${diagnostic.headerLine}`);
	for (const line of diagnostic.detailLines) console.error(line);
}
