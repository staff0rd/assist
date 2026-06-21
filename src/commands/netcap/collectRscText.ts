import { isRscRef, type RscResolve } from "./parseRscRows";

export type TextSink = { text: string[]; hashtags: string[] };

// Visible post text reads as prose (multiple words with a real word); every
// structural token (component name, CSS class, enum, id) is a single identifier
// or lacks an alphabetic run, so this gate keeps sentences and multi-word names.
function isVisibleText(t: string): boolean {
	if (/^(proto\.|com\.linkedin|react\.)/.test(t)) return false;
	if (!/\s/.test(t.trim())) return false;
	return /[a-zA-Z]{3,}/.test(t);
}

const isHashtag = (t: string): boolean => /^#[A-Za-z0-9_]+$/.test(t);

/**
 * Walk a value, resolving references, and push visible prose to `sink.text` and
 * hashtag tokens to `sink.hashtags` in document order.
 */
export function collectRscText(
	v: unknown,
	resolve: RscResolve,
	sink: TextSink,
	seen: Set<string>,
): void {
	if (v == null) return;
	if (typeof v === "string") {
		if (isRscRef(v)) {
			if (!seen.has(v)) {
				seen.add(v);
				collectRscText(resolve(v), resolve, sink, seen);
			}
		} else if (isHashtag(v)) sink.hashtags.push(v);
		else if (isVisibleText(v)) sink.text.push(v);
		return;
	}
	if (Array.isArray(v)) {
		for (const x of v) collectRscText(x, resolve, sink, seen);
		return;
	}
	if (typeof v === "object") {
		for (const val of Object.values(v as Record<string, unknown>)) {
			collectRscText(val, resolve, sink, seen);
		}
	}
}
