const FAST_FAIL_MS = 1000;
const STDOUT_TAIL_LINES = 20;

export type FailureInput = {
	name: string;
	command?: string;
	exitCode: number;
	stderr: string;
	stdout?: string;
	elapsedMs?: number;
};

type FailureDiagnostic = {
	headerLine: string;
	detailLines: string[];
};

function indent(text: string): string[] {
	return text.split(/\r?\n/).map((line) => `  ${line}`);
}

function tailLines(text: string, maxLines: number): string {
	const lines = text.split(/\r?\n/);
	return lines.length <= maxLines ? text : lines.slice(-maxLines).join("\n");
}

function isFastFail(input: FailureInput): boolean {
	return (
		input.exitCode !== 0 &&
		input.elapsedMs !== undefined &&
		input.elapsedMs < FAST_FAIL_MS
	);
}

function fastFailHint(command: string): string[] {
	return [
		`${command} exited almost immediately — it likely failed to start.`,
		`Common causes: not installed on PATH, not authenticated, or misconfigured.`,
		`Try \`${command} --version\` to confirm install, then \`${command} login\` if authentication may be missing.`,
	];
}

function outputDetail(input: FailureInput): string[] {
	const stderr = input.stderr.trim();
	if (stderr) return ["stderr:", ...indent(stderr)];
	const stdout = (input.stdout ?? "").trim();
	if (stdout) {
		return [
			`stdout (no stderr was captured — showing last ${STDOUT_TAIL_LINES} lines):`,
			...indent(tailLines(stdout, STDOUT_TAIL_LINES)),
		];
	}
	return [
		"No stderr or stdout was captured. Check the review folder for partial output, or rerun with --verbose for full streaming output.",
	];
}

export function formatReviewerFailure(input: FailureInput): FailureDiagnostic {
	const command = input.command ?? input.name;
	const seconds = Math.round((input.elapsedMs ?? 0) / 1000);
	const headerLine = `${command} CLI exited with code ${input.exitCode} after ${seconds}s`;
	const detailLines: string[] = [];
	if (isFastFail(input)) detailLines.push(...fastFailHint(command));
	detailLines.push(...outputDetail(input));
	return { headerLine, detailLines };
}

export function printReviewerFailure(input: FailureInput): void {
	if (input.exitCode === 0) return;
	const diagnostic = formatReviewerFailure(input);
	console.error(`[${input.name}] ${diagnostic.headerLine}`);
	for (const line of diagnostic.detailLines) console.error(line);
}
