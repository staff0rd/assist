import { collectRscText, type TextSink } from "./collectRscText";
import type { RscResolve, RscRows } from "./parseRscRows";

export type Mention = { slug: string; name?: string; url: string };

export function asObject(v: unknown): Record<string, unknown> | undefined {
	return v != null && typeof v === "object" && !Array.isArray(v)
		? (v as Record<string, unknown>)
		: undefined;
}

// A profile mention/actor carries a Navigate action whose target is an
// "/in/<slug>/" URL; return that URL if present.
function profileActionUrl(o: Record<string, unknown>): string | undefined {
	const actions = asObject(o.action)?.actions;
	if (!Array.isArray(actions)) return undefined;
	for (const a of actions) {
		const url = asObject(asObject(asObject(a)?.value)?.content)?.url;
		const target = asObject(url)?.url;
		if (typeof target === "string" && /\/in\//.test(target)) return target;
	}
	return undefined;
}

export const slugFromProfileUrl = (url: string): string | undefined =>
	url.match(/\/in\/([^/?]+)/)?.[1];

function visitObjects(
	root: unknown,
	fn: (o: Record<string, unknown>) => void,
): void {
	const stack: unknown[] = [root];
	while (stack.length) {
		const v = stack.pop();
		if (v == null || typeof v !== "object") continue;
		const o = asObject(v);
		if (o) fn(o);
		for (const child of Array.isArray(v) ? v : Object.values(v)) {
			if (child && typeof child === "object") stack.push(child);
		}
	}
}

/**
 * Map every profile slug on the page to its display name and URL, taken from the
 * mention/actor element that bundles the profile action with its label text.
 */
export function buildMentionMap(
	rows: RscRows,
	resolve: RscResolve,
): Map<string, Mention> {
	const map = new Map<string, Mention>();
	visitObjects(rows, (o) => {
		const url = profileActionUrl(o);
		if (!url || o.children == null) return;
		const slug = slugFromProfileUrl(url);
		if (!slug || map.has(slug)) return;
		const sink: TextSink = { text: [], hashtags: [] };
		collectRscText(o.children, resolve, sink, new Set());
		const name = sink.text.join(" ").replace(/\s+/g, " ").trim();
		map.set(slug, name ? { slug, name, url } : { slug, url });
	});
	return map;
}
