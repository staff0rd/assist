import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import {
	type OutputTarget,
	requestSessionOutput,
} from "./daemon/requestSessionOutput";
import { lastLines } from "./lastLines";

type SessionOutputOptions = { lines: string; server?: string | true };

function resolveTarget(
	sessionId: string | undefined,
	server: string | true | undefined,
): OutputTarget | string {
	if (sessionId && server)
		return "Pass either a session id or --server, not both";
	if (server)
		return {
			server: {
				origin: getCurrentOrigin(process.cwd()),
				group: server === true ? "default" : server,
			},
		};
	if (!sessionId) return "Pass a session id or --server [group]";
	if (sessionId.includes(":"))
		return `Session ${sessionId} is on a linked node; reading linked-node sessions is not supported yet`;
	return { sessionId };
}

export async function sessionOutput(
	sessionId: string | undefined,
	options: SessionOutputOptions,
): Promise<void> {
	const count = Number.parseInt(options.lines, 10);
	if (!Number.isInteger(count) || count < 1)
		return fail(`-n must be a positive integer, got ${options.lines}`);
	const target = resolveTarget(sessionId, options.server);
	if (typeof target === "string") return fail(target);
	try {
		const scrollback = await requestSessionOutput(target);
		for (const line of lastLines(scrollback, count)) console.log(line);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}

function fail(message: string): void {
	console.error(message);
	process.exitCode = 1;
}
