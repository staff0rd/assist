const PREVIEW = 200;

export function condensePreview(value: string): string {
	const line = value.replace(/\s+/g, " ").trim();
	return line.length > PREVIEW ? `${line.slice(0, PREVIEW)}…` : line;
}
