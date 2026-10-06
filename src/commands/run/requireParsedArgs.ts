import { extractOption } from "./extractOption";
import { extractOptionalValueFlag } from "./extractOptionalValueFlag";

function findAddIndex(): number {
	const addIndex = process.argv.indexOf("add");
	if (addIndex === -1 || addIndex + 2 >= process.argv.length) return -1;
	return addIndex;
}

function parsePort(raw: string | undefined): number | undefined {
	if (raw === undefined) return undefined;
	const port = Number(raw);
	if (!Number.isInteger(port) || port <= 0) {
		console.error(`--port must be a positive integer, got "${raw}"`);
		process.exit(1);
	}
	return port;
}

function extractAddArgs(addIndex: number) {
	const rawArgs = process.argv.slice(addIndex + 3);
	const cwd = extractOption(rawArgs, "--cwd");
	const port = extractOption(cwd.remaining, "--port");
	const server = extractOptionalValueFlag(port.remaining, "--server");
	const repo = extractOptionalValueFlag(server.remaining, "--repo");
	return {
		name: process.argv[addIndex + 1],
		command: process.argv[addIndex + 2],
		args: repo.remaining,
		options: {
			cwd: cwd.value,
			server: server.value,
			port: parsePort(port.value),
		},
		repo: repo.value,
	};
}

export function requireParsedArgs() {
	const addIndex = findAddIndex();
	if (addIndex === -1) {
		console.error("Usage: assist run add <name> <command> [args...]");
		process.exit(1);
	}
	return extractAddArgs(addIndex);
}
