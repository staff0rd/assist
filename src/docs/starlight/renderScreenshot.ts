import type { DocsScreenshot } from "../docsPageSchema";
import { darkVariantFile } from "../screenshotVariants";
import { escapeHtml } from "./escapeHtml";

export function renderScreenshot(
	screenshot: DocsScreenshot,
	basePath: string,
	isCaptured: (file: string) => boolean = () => true,
): string {
	const alt = escapeHtml(screenshot.alt);
	const img = (file: string, hiddenInTheme?: "light" | "dark") => {
		const hidden = hiddenInTheme ? `${hiddenInTheme}:sl-hidden` : "";
		if (!isCaptured(file))
			return `<div class="assist-screenshot-missing ${hidden}">Screenshot not captured yet: ${escapeHtml(file)}</div>`;
		const src = `${basePath}screenshots/${file}`;
		const classAttr = hidden ? ` class="${hidden}"` : "";
		return `<a href="${src}" target="_blank" title="Open full size"${classAttr}><img src="${src}" alt="${alt}" loading="lazy"></a>`;
	};
	const image = screenshot.theme
		? img(screenshot.file)
		: img(screenshot.file, "dark") +
			img(darkVariantFile(screenshot.file), "light");
	const figureClass = screenshot.phone
		? "assist-screenshot assist-screenshot-phone"
		: "assist-screenshot";
	return `<figure class="${figureClass}">${image}<figcaption>${alt}</figcaption></figure>`;
}
