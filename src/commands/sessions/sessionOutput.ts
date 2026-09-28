import { requestSessionOutput } from "./daemon/requestSessionOutput";
import { lastLines } from "./lastLines";

export async function sessionOutput(
	sessionId: string,
	options: { lines: string },
): Promise<void> {
	const count = Number.parseInt(options.lines, 10);
	if (!Number.isInteger(count) || count < 1)
		return fail(`-n must be a positive integer, got ${options.lines}`);
	if (sessionId.includes(":"))
		return fail(
			`Session ${sessionId} is on a linked node; reading linked-node sessions is not supported yet`,
		);
	try {
		const scrollback = await requestSessionOutput(sessionId);
		for (const line of lastLines(scrollback, count)) console.log(line);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}

function fail(message: string): void {
	console.error(message);
	process.exitCode = 1;
}
