import { extractYamlComments } from "./extractYamlComments";

function isHeaderLine(line: string): boolean {
	const trimmed = line.trim();
	return trimmed === "" || trimmed.startsWith("#");
}

export function extractShellComments(text: string): string[] {
	const lines = text.split("\n");
	let firstCodeLine = 0;
	while (firstCodeLine < lines.length && isHeaderLine(lines[firstCodeLine])) {
		firstCodeLine++;
	}
	return extractYamlComments(lines.slice(firstCodeLine).join("\n"));
}
