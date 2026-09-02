import { execSync } from "node:child_process";
import { loadConfig } from "../shared/loadConfig";
import { buildCommitMessage } from "./commit/buildCommitMessage";
import { execCommit } from "./commit/execCommit";
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

	if (args.length < 1) {
		console.error("Usage: assist commit <message> [files...]");
		process.exit(1);
	}

	const message = args[0];
	const files = args.slice(1);
	const config = loadConfig();

	validateMessage(message, config);
	await execCommit(
		files,
		buildCommitMessage(message, options.ref ?? []),
		config,
	);
}
