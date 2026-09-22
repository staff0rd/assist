import chalk from "chalk";
import { spawnClaude } from "../../shared/spawnClaude";
import { buildConfigurePrompt } from "./buildConfigurePrompt";
import { readRepoStreams } from "./readRepoStreams";
import { reportDerivedStreams } from "./reportDerivedStreams";

const REPO_RE = /^[^/\s]+\/[^/\s]+$/;

export async function releasesConfigure(repo: string): Promise<void> {
	if (!REPO_RE.test(repo)) {
		console.error(chalk.red(`Expected <owner/repo>, got '${repo}'.`));
		process.exitCode = 1;
		return;
	}
	const before = readRepoStreams(repo);
	const { done } = spawnClaude(buildConfigurePrompt(repo), {
		allowEdits: true,
	});
	await done;
	reportDerivedStreams(repo, "streams" in before ? before.streams : []);
}
