import * as fs from "node:fs";
import * as path from "node:path";
import { backlogRunMarkers } from "../backlogRunMarkers";
import { deriveHistoryFields } from "../deriveHistoryFields";
import type { HistoricalSession } from "../parseSessionFile";
import { codexRolloutMeta } from "./codexRolloutMeta";
import { readCodexHeadLines } from "./readCodexHeadLines";

export async function parseCodexSessionFile(
	filePath: string,
): Promise<HistoricalSession | null> {
	try {
		const meta = codexRolloutMeta(await readCodexHeadLines(filePath));
		if (!meta.sessionId) return null;
		const lastActivity = await mtime(filePath);
		const name = meta.firstMessage.slice(0, 80);
		const markers = backlogRunMarkers(meta.firstMessage);
		return {
			sessionId: meta.sessionId,
			name: name || `Session ${meta.sessionId.slice(0, 8)}`,
			project: meta.cwd ? path.basename(meta.cwd) : "",
			cwd: meta.cwd,
			timestamp: meta.timestamp || lastActivity,
			lastActivity,
			origin: "wsl",
			harness: "codex",
			...deriveHistoryFields(markers.commandName, markers.commandArgs, name),
		};
	} catch {
		return null;
	}
}

async function mtime(filePath: string): Promise<string> {
	return (await fs.promises.stat(filePath)).mtime.toISOString();
}
