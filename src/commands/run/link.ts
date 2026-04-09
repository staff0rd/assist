import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { extractOption } from "./extractOption";

function findLinkIndex(): number {
	const idx = process.argv.indexOf("link");
	if (idx === -1 || idx + 1 >= process.argv.length) return -1;
	return idx;
}

function parseLinkArgs(): { path: string; prefix: string } | null {
	const idx = findLinkIndex();
	if (idx === -1) return null;
	const path = process.argv[idx + 1];
	const rest = process.argv.slice(idx + 2);
	const { value: prefix } = extractOption(rest, "--prefix");
	if (!prefix) return null;
	return { path, prefix };
}

function hasDuplicateLink(runList: unknown[], linkPath: string): boolean {
	return runList.some(
		(r) =>
			typeof r === "object" &&
			r !== null &&
			"link" in r &&
			(r as { link: string }).link === linkPath,
	);
}

export function link(): void {
	const parsed = parseLinkArgs();
	if (!parsed) {
		console.error("Usage: assist run link <path> --prefix <prefix>");
		process.exit(1);
	}

	const config = loadProjectConfig();
	if (!config.run) config.run = [];
	const runList = config.run as unknown[];

	if (hasDuplicateLink(runList, parsed.path)) {
		console.error(`Link to "${parsed.path}" already exists`);
		process.exit(1);
	}

	runList.push({ link: parsed.path, prefix: parsed.prefix });
	saveConfig(config);

	console.log(
		`Linked run configurations from: ${parsed.path} (prefix: ${parsed.prefix})`,
	);
}
