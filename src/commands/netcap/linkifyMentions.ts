import type { Mention } from "./buildMentionMap";

/** Replace each mention's display name in the text with a markdown profile link. */
export function linkifyMentions(text: string, mentions: Mention[]): string {
	let out = text;
	for (const m of mentions) {
		if (m.name && out.includes(m.name)) {
			out = out.replace(m.name, `[${m.name}](${m.url})`);
		}
	}
	return out;
}
