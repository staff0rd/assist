export function parsePort(raw: string | undefined): number | undefined {
	if (raw === undefined) return undefined;
	const port = Number(raw);
	if (!Number.isInteger(port) || port <= 0) {
		console.error(`--port must be a positive integer, got "${raw}"`);
		process.exit(1);
	}
	return port;
}
