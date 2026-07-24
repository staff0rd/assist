export function appendScreenshots(body: string, screenshots: string[]): string {
	if (screenshots.length === 0) return body;
	return `${body}\n\n## Screenshots\n\n${screenshots.join("\n\n")}`;
}
