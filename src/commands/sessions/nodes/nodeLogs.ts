import { daemonPaths } from "../daemon/daemonPaths";
import { findLinkSpec } from "../shared/loadLinkSpecs";
import { readLogTail } from "../shared/readLogTail";
import { resolveNodeName } from "../shared/resolveNodeName";
import { describePeerError, fetchPeerJson } from "./fetchPeerJson";

type LogTail = { nodeName: string; path: string; lines: string[] };

async function fetchLogTail(name: string, lines: number): Promise<LogTail> {
	if (name === resolveNodeName())
		return {
			nodeName: name,
			path: daemonPaths.log,
			lines: readLogTail(daemonPaths.log, lines),
		};
	const link = findLinkSpec(name);
	if (!link)
		throw new Error(`No link named ${name}; see assist sessions nodes`);
	try {
		return await fetchPeerJson<LogTail>(
			link.url,
			`/api/daemon-log?lines=${lines}`,
		);
	} catch (error) {
		throw new Error(
			`Could not read ${name}'s daemon log: ${describePeerError(error)}. Run assist sessions nodes doctor ${name}`,
		);
	}
}

export async function nodeLogs(
	name: string,
	options: { lines: string; json?: boolean },
): Promise<void> {
	const lines = Number.parseInt(options.lines, 10);
	if (!Number.isInteger(lines) || lines < 1)
		throw new Error(`-n must be a positive integer, got ${options.lines}`);
	const tail = await fetchLogTail(name, lines);
	if (options.json) {
		console.log(JSON.stringify(tail, null, 2));
		return;
	}
	for (const line of tail.lines) console.log(line);
}
