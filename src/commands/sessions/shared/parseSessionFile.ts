import * as fs from "node:fs";
import type { HarnessKind } from "../../../shared/harnesses";
import { deriveHistoryFields, type SessionType } from "./deriveHistoryFields";
import { extractSessionMeta } from "./extractSessionMeta";
import { deriveProject } from "./deriveProject";
import type { SessionOrigin } from "./SessionOrigin";

export type { SessionOrigin } from "./SessionOrigin";

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
	origin: SessionOrigin;
	harness?: HarnessKind;
	sessionType?: SessionType;
	itemId?: number;
	prompt?: string;
	node?: string;
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
