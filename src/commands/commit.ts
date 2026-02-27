import { execSync } from "node:child_process";
import { loadConfig } from "../shared/loadConfig";
import { shellQuote } from "../shared/shellQuote";
import type { AssistConfig } from "../shared/types";
import { validateMessage } from "./commit/validateMessage";

function commitStaged(message: string): string {
	execSync(`git commit -m ${shellQuote(message)}`, { stdio: "inherit" });
	return execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf-8",
	}).trim();
}

function stageAndCommit(files: string[], message: string): string {
	const escaped = files.map(shellQuote).join(" ");
	execSync(`git add ${escaped}`, { stdio: "inherit" });
	return commitStaged(message);
}

function execCommit(
	files: string[],
	message: string,
	config: AssistConfig,
): void {
	try {
		if (config.commit?.pull) {
			execSync("git pull", { stdio: "inherit" });
		}
		const sha =
			files.length > 0 ? stageAndCommit(files, message) : commitStaged(message);
		console.log(`Committed: ${sha}`);
		if (config.commit?.push) {
			execSync("git push", { stdio: "inherit" });
			console.log("Pushed to remote");
		}
		process.exit(0);
	} catch (_error) {
		process.exit(1);
	}
}

export function commit(args: string[]): void {
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
	execCommit(files, message, config);
}
