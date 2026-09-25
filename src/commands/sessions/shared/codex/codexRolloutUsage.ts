import * as fs from "node:fs";
import type { ResponseUsage } from "../../../../shared/db/recordPhaseTranscriptUsage";
import { applyTokenInfo, type CodexRolloutUsage } from "./applyTokenInfo";
import {
	type CodexRolloutEntry,
	parseRolloutEntry,
	rolloutPayload,
	rolloutString,
} from "./parseRolloutEntry";
import { toRateLimits } from "./toRateLimits";

export function codexRolloutUsage(lines: string[]): CodexRolloutUsage {
	const usage: CodexRolloutUsage = { responses: [] };
	const byId = new Map<string, ResponseUsage>();
	let conversationId = "";
	for (const line of lines) {
		const entry = parseRolloutEntry(line);
		if (!entry) continue;
		conversationId ||= sessionMetaId(entry);
		const payload = tokenCountPayload(entry);
		if (!payload) continue;
		applyTokenInfo(usage, byId, conversationId, payload.info);
		usage.rateLimits = toRateLimits(payload.rate_limits) ?? usage.rateLimits;
	}
	usage.responses = [...byId.values()];
	return usage;
}

export async function readCodexRolloutUsage(
	rolloutPath: string,
): Promise<CodexRolloutUsage> {
	const content = await fs.promises.readFile(rolloutPath, "utf8");
	return codexRolloutUsage(content.split("\n"));
}

function sessionMetaId(entry: CodexRolloutEntry): string {
	if (entry.type !== "session_meta") return "";
	return rolloutString(rolloutPayload(entry).session_id);
}

function tokenCountPayload(
	entry: CodexRolloutEntry,
): { info?: unknown; rate_limits?: unknown } | undefined {
	if (entry.type !== "event_msg") return undefined;
	const payload = rolloutPayload(entry);
	return payload.type === "token_count" ? payload : undefined;
}
