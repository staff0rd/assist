import * as fs from "node:fs";
import * as path from "node:path";
import { deriveHistoryFields, type SessionType } from "./deriveHistoryFields";
import { extractSessionMeta } from "./extractSessionMeta";

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
	sessionType?: SessionType;
	itemId?: number;
	prompt?: string;
};

export async function parseSessionFile(
	filePath: string,
): Promise<HistoricalSession | null> {
	let handle: fs.promises.FileHandle | undefined;
	try {
		handle = await fs.promises.open(filePath, "r");
		const buf = Buffer.alloc(16_384);
		const { bytesRead } = await handle.read(buf, 0, buf.length, 0);
		const lines = buf
			.toString("utf8", 0, bytesRead)
			.split("\n")
			.filter(Boolean);

		const meta = extractSessionMeta(lines);
		if (!meta.sessionId) return null;

		const timestamp =
			meta.timestamp || (await fs.promises.stat(filePath)).mtime.toISOString();
		const project = meta.cwd
			? path.basename(meta.cwd)
			: dirNameToProject(filePath);

		return {
			sessionId: meta.sessionId,
			name: meta.name || `Session ${meta.sessionId.slice(0, 8)}`,
			project,
			cwd: meta.cwd,
			timestamp,
			...deriveHistoryFields(meta.commandName, meta.commandArgs, meta.name),
		};
	} catch {
		return null;
	} finally {
		await handle?.close();
	}
}

function dirNameToProject(filePath: string): string {
	const dirName = path.basename(path.dirname(filePath));
	const parts = dirName.split("--");
	return parts[parts.length - 1].replace(/-/g, "/");
}
