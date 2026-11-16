import type { Tokens } from "marked";
import { escapeHtml } from "./escapeHtml";
import { imageTag, type ResolveImageSrc } from "./imageTag";
import { sanitizeHtmlImages } from "./sanitizeHtmlImages";

export function imageRenderers(resolveImageSrc: ResolveImageSrc) {
	return {
		html(token: Tokens.HTML | Tokens.Tag) {
			return sanitizeHtmlImages(token.text, resolveImageSrc);
		},
		image({ href, text }: Tokens.Image) {
			return (
				imageTag({ src: href, alt: text }, resolveImageSrc) ?? escapeHtml(text)
			);
		},
	};
}
