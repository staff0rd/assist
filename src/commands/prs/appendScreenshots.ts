import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";

function reference({ path, alt }: PreviewAttachment): string {
	const target = /\s/.test(path) ? `<${path}>` : path;
	return `![${alt}](${target})`;
}

export function appendScreenshots(
	body: string,
	attachments: PreviewAttachment[],
): string {
	if (attachments.length === 0) return body;
	return `${body}\n\n## Screenshots\n\n${attachments.map(reference).join("\n\n")}`;
}
