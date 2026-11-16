import { escapeHtml } from "./escapeHtml";

export type ResolveImageSrc = (src: string) => string | null;

const SIZE = /^\d+%?$/;

export function imageTag(
	attrs: { src: string; alt?: string; width?: string; height?: string },
	resolveSrc: ResolveImageSrc,
): string | null {
	const src = resolveSrc(attrs.src.trim());
	if (!src) return null;
	const parts = [`src="${escapeHtml(src)}"`];
	if (attrs.alt !== undefined) parts.push(`alt="${escapeHtml(attrs.alt)}"`);
	for (const name of ["width", "height"] as const) {
		const value = attrs[name];
		if (value && SIZE.test(value)) parts.push(`${name}="${value}"`);
	}
	return `<img ${parts.join(" ")}>`;
}
