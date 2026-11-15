import { claudeContentBlocksOf } from "./claudeContentBlocksOf";

const ARTIFACT_RESULT_URL =
	/^(?:Published|Created|Updated)\b[^\n]*? at (https:\/\/claude\.ai\/(?:code\/)?artifact\/[\w-]+)/;

function resultText(content: unknown): string {
	if (typeof content === "string") return content;
	return claudeContentBlocksOf(content)
		.map((block) => (typeof block.text === "string" ? block.text : ""))
		.join("\n");
}

export function claudeArtifactResultUrls(
	entries: Record<string, unknown>[],
): Map<string, string> {
	const urls = new Map<string, string>();
	for (const entry of entries) {
		if (entry.type !== "user") continue;
		const content = (entry.message as { content?: unknown } | undefined)
			?.content;
		for (const block of claudeContentBlocksOf(content)) {
			if (block.type !== "tool_result" || block.is_error) continue;
			if (typeof block.tool_use_id !== "string") continue;
			const url = resultText(block.content)
				.trimStart()
				.match(ARTIFACT_RESULT_URL)?.[1];
			if (url) urls.set(block.tool_use_id, url);
		}
	}
	return urls;
}
