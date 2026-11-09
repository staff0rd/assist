import { extractFlag } from "./extractFlag";
import { extractOption } from "./extractOption";
import { extractOptionalValueFlag } from "./extractOptionalValueFlag";
import { extractRepeatedOption } from "./extractRepeatedOption";
import { parseEnvPairs } from "./parseEnvPairs";
import { parseParamSpecs } from "./parseParamSpecs";
import { parseProtocol } from "./parseProtocol";
import { parsePort } from "./parsePort";

function findAddIndex(): number {
	const addIndex = process.argv.indexOf("add");
	if (addIndex === -1 || addIndex + 2 >= process.argv.length) return -1;
	return addIndex;
}

function extractAddArgs(addIndex: number) {
	const rawArgs = process.argv.slice(addIndex + 3);
	const env = extractRepeatedOption(rawArgs, "--env");
	const pre = extractRepeatedOption(env.remaining, "--pre");
	const param = extractRepeatedOption(pre.remaining, "--param");
	const quiet = extractFlag(param.remaining, "--quiet");
	const filter = extractOption(quiet.remaining, "--filter");
	const cwd = extractOption(filter.remaining, "--cwd");
	const port = extractOption(cwd.remaining, "--port");
	const protocol = extractOption(port.remaining, "--protocol");
	const path = extractOption(protocol.remaining, "--path");
	const server = extractOptionalValueFlag(path.remaining, "--server");
	const repo = extractOptionalValueFlag(server.remaining, "--repo");
	return {
		name: process.argv[addIndex + 1],
		command: process.argv[addIndex + 2],
		args: repo.remaining,
		options: {
			cwd: cwd.value,
			server: server.value,
			port: parsePort(port.value),
			protocol: parseProtocol(protocol.value),
			path: path.value,
			env: parseEnvPairs(env.values),
			pre: pre.values.length > 0 ? pre.values : undefined,
			filter: filter.value,
			quiet: quiet.present || undefined,
			params: parseParamSpecs(param.values),
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
