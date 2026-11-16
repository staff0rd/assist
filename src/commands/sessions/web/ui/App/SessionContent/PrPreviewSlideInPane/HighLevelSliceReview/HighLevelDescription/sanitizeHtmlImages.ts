import { escapeHtml } from "./escapeHtml";
import { imageTag, type ResolveImageSrc } from "./imageTag";

const IMG_TAG = /<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const ATTR = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/]+))/g;

function decodeEntities(value: string): string {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&");
}

function rebuildImage(rawAttrs: string, resolveSrc: ResolveImageSrc) {
	const attrs: Record<string, string> = {};
	for (const [, name, dq, sq, bare] of rawAttrs.matchAll(ATTR))
		attrs[(name as string).toLowerCase()] = decodeEntities(
			dq ?? sq ?? bare ?? "",
		);
	if (attrs.src === undefined) return null;
	return imageTag(
		{
			src: attrs.src,
			alt: attrs.alt,
			width: attrs.width,
			height: attrs.height,
		},
		resolveSrc,
	);
}

// Raw HTML in a PR body is untrusted: only <img> tags with an allowed src are
// rebuilt from their src/alt/width/height, and everything else is shown as text.
export function sanitizeHtmlImages(
	html: string,
	resolveSrc: ResolveImageSrc,
): string {
	let out = "";
	let last = 0;
	for (const match of html.matchAll(IMG_TAG)) {
		const image = rebuildImage(match[1] ?? "", resolveSrc);
		if (!image) continue;
		out += escapeHtml(html.slice(last, match.index)) + image;
		last = match.index + match[0].length;
	}
	return out + escapeHtml(html.slice(last));
}
