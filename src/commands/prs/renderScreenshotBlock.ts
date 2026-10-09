import { extname } from "node:path";
import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);

function reference({ path, alt }: PreviewAttachment): string {
	const target = /\s/.test(path) ? `<${path}>` : path;
	return `![${alt}](${target})`;
}

function cell(text: string): string {
	return text.replaceAll("|", String.raw`\|`);
}

function row(cells: string[]): string {
	return `| ${cells.join(" | ")} |`;
}

function imageTable(images: PreviewAttachment[]): string[] {
	if (images.length === 0) return [];
	const lines: string[] = [];
	for (let i = 0; i < images.length; i += 2) {
		const pair = images.slice(i, i + 2);
		const captions = [0, 1].map((j) => (pair[j] ? cell(pair[j].alt) : ""));
		const refs = [0, 1].map((j) => (pair[j] ? cell(reference(pair[j])) : ""));
		if (i === 0) lines.push(row(captions), row(["---", "---"]));
		else lines.push(row(captions.map((c) => (c ? `**${c}**` : ""))));
		lines.push(row(refs));
	}
	return [lines.join("\n")];
}

export function renderScreenshotBlock(
	attachments: PreviewAttachment[],
): string[] {
	const isVideo = (a: PreviewAttachment) =>
		VIDEO_EXTENSIONS.has(extname(a.path).toLowerCase());
	return [
		...imageTable(attachments.filter((a) => !isVideo(a))),
		...attachments.filter(isVideo).map(reference),
	];
}
