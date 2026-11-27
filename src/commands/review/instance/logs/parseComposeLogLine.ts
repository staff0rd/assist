export type ComposeLogLine = { service: string; at: number; message: string };

const LINE = /^(\S+)\s+\|\s(\S+)\s?(.*)$/;

export function parseComposeLogLine(
	line: string,
	project: string,
): ComposeLogLine | undefined {
	const match = LINE.exec(line);
	if (!match) return undefined;
	const [, container, timestamp, message] = match;
	const at = Date.parse(timestamp);
	if (Number.isNaN(at)) return undefined;
	const service = container
		.replace(new RegExp(`^${escapeRegExp(project)}[-_]`), "")
		.replace(/[-_]\d+$/, "");
	return { service, at, message };
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
