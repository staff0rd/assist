import type * as net from "node:net";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { queryDaemon } from "../daemon/queryDaemon";
import { formatSessionRows } from "./formatSessionRows";
import { readAgentNames } from "./readAgentNames";
import { readBranch } from "./readBranch";
import { toSessionRow } from "./toSessionRow";

type ListSessionsOptions = { json?: boolean; node?: string };

export async function listSessions(
	options: ListSessionsOptions,
): Promise<void> {
	let socket: net.Socket;
	try {
		socket = await connectToDaemon();
	} catch {
		console.error("No sessions daemon is running");
		process.exitCode = 1;
		return;
	}
	const { sessions } = await queryDaemon(socket);
	socket.destroy();
	const lookups = { agentNames: readAgentNames(), branchOf: readBranch };
	const rows = sessions
		.map((session) => toSessionRow(session, lookups))
		.filter((row) => !options.node || row.node === options.node);
	if (options.json) {
		console.log(JSON.stringify(rows, null, 2));
		return;
	}
	if (rows.length === 0) {
		console.log(
			options.node ? `No sessions on ${options.node}` : "No sessions",
		);
		return;
	}
	for (const line of formatSessionRows(rows)) console.log(line);
}
