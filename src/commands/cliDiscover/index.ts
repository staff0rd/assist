import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { assertCliExists } from "./assertCliExists";
import { colorize } from "./colorize";
import { discoverAll } from "./discoverAll";
import { formatHuman } from "./formatHuman";
import { parseCached } from "./parseCached";
import { updateSettings } from "./updateSettings";

type Options = { noCache: boolean };

function logPath(cli: string): string {
	const safeName = cli.replace(/\s+/g, "-");
	return join(homedir(), ".assist", `cli-discover-${safeName}.log`);
}

function readCache(cli: string): string | undefined {
	const path = logPath(cli);
	if (!existsSync(path)) return undefined;
	return readFileSync(path, "utf-8");
}

function writeCache(cli: string, output: string): void {
	const dir = join(homedir(), ".assist");
	mkdirSync(dir, { recursive: true });
	writeFileSync(logPath(cli), output);
}

export async function cliDiscover(
	cli: string,
	options: Options = { noCache: false },
): Promise<void> {
	if (!cli) {
		console.error("Usage: assist cli-discover <cli>");
		process.exit(1);
	}

	if (!options.noCache) {
		const cached = readCache(cli);
		if (cached) {
			console.log(colorize(cached));
			updateSettings(cli, parseCached(cli, cached));
			return;
		}
	}

	assertCliExists(cli);
	const commands = await discoverAll(cli);
	const output = formatHuman(cli, commands);
	console.log(colorize(output));
	writeCache(cli, output);
	updateSettings(cli, commands);
}
