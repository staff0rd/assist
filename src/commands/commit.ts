import { execSync } from "node:child_process";
import { loadConfig } from "../shared/loadConfig";
import { buildCommitMessage } from "./commit/buildCommitMessage";
import { execCommit } from "./commit/execCommit";
import { mergeInProgress } from "./commit/mergeInProgress";
import { validateCommitRefs } from "./commit/validateCommitRefs";
import { validateMessage } from "./commit/validateMessage";

type CommitOptions = {
	ref?: string[];
};

export async function commit(
	args: string[],
	options: CommitOptions = {},
): Promise<void> {
	if (args[0] === "status") {
		execSync("git status && echo '---DIFF---' && git diff", {
			stdio: "inherit",
		});
		return;
	}

	const merging = mergeInProgress();
	const refs = options.ref ?? [];
	if (args.length < 1 && !(merging && refs.length === 0)) {
		console.error("Usage: assist commit <message> [files...]");
		if (merging) {
			console.error(
				"To conclude the merge with git's prepared message, run assist commit with no arguments.",
			);
		}
		process.exit(1);
	}

	const config = loadConfig();
	if (args.length === 0) {
		await execCommit([], null, config, { merging });
		return;
	}

	const message = args[0];
	validateMessage(message, config);
	validateCommitRefs(refs);
	await execCommit(args.slice(1), buildCommitMessage(message, refs), config, {
		merging,
	});
}
