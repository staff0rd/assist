import type { PrPreviewComment } from "./SessionInfoBase";

export function formatPreviewComments(comments: PrPreviewComment[]): string[] {
	return comments.map((c, i) => {
		const quoted = c.quote
			.split("\n")
			.map((line) => `  > ${line}`)
			.join("\n");
		return `${i + 1}. On:\n${quoted}\n   Comment: ${c.note}\n`;
	});
}
