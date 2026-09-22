import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import type { ConfigKeyScope } from "../config/writeConfigKeys";
import { checkStreamGraph } from "./checkStreamGraph";
import { readStreamsInput } from "./readStreamsInput";
import { reportDerivedStreams } from "./reportDerivedStreams";
import { withCurrentRepo } from "./withCurrentRepo";
import { writeReleaseStreams } from "./writeReleaseStreams";

type ConfigureOptions = { streams?: string; scope?: string };

function fail(message: string, details: string[] = []): void {
	console.error(chalk.red(message));
	for (const detail of details) console.error(chalk.red(`  ${detail}`));
	process.exitCode = 1;
}

function reportWritten(
	incoming: Record<string, unknown>[],
	target: string,
): void {
	const repos = new Set(incoming.map((s) => String(s.repo).toLowerCase()));
	const declared = loadConfig().releases?.streams ?? [];
	reportDerivedStreams(
		declared.filter((s) => repos.has(s.repo.toLowerCase())),
		target,
	);
}

export function releasesConfigure(options: ConfigureOptions = {}): void {
	const scope: ConfigKeyScope = options.scope === "repo" ? "repo" : "project";
	const input = readStreamsInput(options.streams ?? "-");
	if ("error" in input) return fail(`Could not read --streams: ${input.error}`);

	const incoming = withCurrentRepo(input.streams);
	const broken = checkStreamGraph(incoming);
	if (broken.length > 0)
		return fail(
			"The graph does not hold together, so nothing was written:",
			broken,
		);

	const written = writeReleaseStreams(incoming, scope);
	if (!written.ok)
		return fail(
			"releases.streams does not validate, so nothing was written:",
			written.errors,
		);
	reportWritten(incoming, written.target);
}
