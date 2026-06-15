import * as fs from "node:fs";
import * as path from "node:path";
import { deriveHistoryFields, type SessionType } from "./deriveHistoryFields";
import { extractSessionMeta } from "./extractSessionMeta";

export type SessionOrigin = "wsl" | "windows";

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
	origin: SessionOrigin;
	sessionType?: SessionType;
	itemId?: number;
	prompt?: string;
};

export async function parseSessionFile(
	filePath: string,
	origin: SessionOrigin = "wsl",
): Promise<HistoricalSession | null> {
	let handle: fs.promises.FileHandle | undefined;
	try {
		handle = await fs.promises.open(filePath, "r");
		const meta = extractSessionMeta(await readHeadLines(handle));
		if (!meta.sessionId) return null;

		const timestamp =
			meta.timestamp || (await fs.promises.stat(filePath)).mtime.toISOString();

		return {
			sessionId: meta.sessionId,
			name: meta.name || `Session ${meta.sessionId.slice(0, 8)}`,
			project: deriveProject(meta.cwd, filePath, origin),
			cwd: meta.cwd,
			timestamp,
			origin,
			...deriveHistoryFields(meta.commandName, meta.commandArgs, meta.name),
		};
	} catch {
		return null;
	} finally {
		await handle?.close();
	}
}

async function readHeadLines(
	handle: fs.promises.FileHandle,
): Promise<string[]> {
	const buf = Buffer.alloc(16_384);
	const { bytesRead } = await handle.read(buf, 0, buf.length, 0);
	return buf.toString("utf8", 0, bytesRead).split("\n").filter(Boolean);
}

function deriveProject(
	cwd: string,
	filePath: string,
	origin: SessionOrigin,
): string {
	if (!cwd) return dirNameToProject(filePath);
	// why: POSIX basename mangles Windows cwds like C:\Users\me\repo
	return origin === "windows" ? path.win32.basename(cwd) : path.basename(cwd);
}

function dirNameToProject(filePath: string): string {
	const dirName = path.basename(path.dirname(filePath));
	const parts = dirName.split("--");
	return parts[parts.length - 1].replace(/-/g, "/");
}
