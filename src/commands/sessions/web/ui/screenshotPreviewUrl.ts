const IMAGE_MARKDOWN = /!\[[^\]]*]\(\s*<?([^)>\s]+)/;
const BARE_URL = /https?:\/\/\S+/;

export function screenshotPreviewUrl(markdown: string): string {
	return (
		markdown.match(IMAGE_MARKDOWN)?.[1] ?? markdown.match(BARE_URL)?.[0] ?? ""
	);
}
