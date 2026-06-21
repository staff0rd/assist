import { collectRscText, type TextSink } from "./collectRscText";
import { asObject } from "./buildMentionMap";
import type { RscResolve } from "./parseRscRows";

export type PostRaw = {
	text: string[];
	hashtags: string[];
	profileUrls: string[];
	links: string[];
	related: string[];
};

const isCommentary = (o: Record<string, unknown>): boolean =>
	asObject(o.viewTrackingSpecs)?.viewName === "feed-commentary";

/**
 * Walk one post's row, accumulating its commentary text and hashtags (scoped to
 * feed-commentary containers), every navigate URL split into profile vs other,
 * and any related activity urn.
 */
export function walkPostRow(
	v: unknown,
	resolve: RscResolve,
	raw: PostRaw,
): void {
	if (v == null || typeof v !== "object") return;
	if (Array.isArray(v)) {
		for (const x of v) walkPostRow(x, resolve, raw);
		return;
	}
	const o = v as Record<string, unknown>;
	if (
		o.$type === "proto.sdui.actions.core.NavigateToUrl" &&
		typeof o.url === "string"
	) {
		if (/\/in\//.test(o.url)) raw.profileUrls.push(o.url);
		else raw.links.push(o.url);
	}
	if (o.$type === "proto.sdui.actions.requests.RequestedArguments") {
		const a = JSON.stringify(o).match(/urn:li:activity:\d+/);
		if (a) raw.related.push(a[0]);
	}
	if (isCommentary(o)) {
		const sink: TextSink = { text: raw.text, hashtags: raw.hashtags };
		collectRscText(o.children, resolve, sink, new Set());
	}
	for (const val of Object.values(o)) walkPostRow(val, resolve, raw);
}
