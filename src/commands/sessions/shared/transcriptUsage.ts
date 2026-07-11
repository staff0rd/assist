import * as fs from "node:fs";
import type { ResponseUsage } from "../../../shared/db/recordPhaseTranscriptUsage";

type AssistantEntry = {
	type?: string;
	message?: {
		id?: string;
		usage?: { input_tokens?: number; output_tokens?: number };
	};
};

export function transcriptUsage(lines: string[]): ResponseUsage[] {
	const byId = new Map<string, ResponseUsage>();
	for (const line of lines) {
		if (!line.trim()) continue;
		let entry: AssistantEntry;
		try {
			entry = JSON.parse(line);
		} catch {
			continue;
		}
		if (entry.type !== "assistant") continue;
		const id = entry.message?.id;
		const usage = entry.message?.usage;
		if (!id || !usage) continue;
		byId.set(id, {
			messageId: id,
			inputTokens: usage.input_tokens ?? 0,
			outputTokens: usage.output_tokens ?? 0,
		});
	}
	return [...byId.values()];
}

export async function readTranscriptUsage(
	transcriptPath: string,
): Promise<ResponseUsage[]> {
	const content = await fs.promises.readFile(transcriptPath, "utf8");
	return transcriptUsage(content.split("\n"));
}
