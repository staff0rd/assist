export function parsePort(flag: string, value: string | undefined): number {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65_535)
		throw new Error(`${flag} must be a port number, got ${value}`);
	return port;
}
