import { execSync } from "node:child_process";
import { loadConfig } from "../shared/loadConfig";
import type { AssistConfig } from "../shared/types";

const MAX_MESSAGE_LENGTH = 50;
const CONVENTIONAL_COMMIT_REGEX =
	/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(!)?(\(.+\))?!?: .+$/;

function validateMessage(message: string, config: AssistConfig): void {
	if (message.toLowerCase().includes("claude")) {
		console.error("Error: Commit message must not reference Claude");
		process.exit(1);
	}

	if (config.commit?.conventional && !CONVENTIONAL_COMMIT_REGEX.test(message)) {
		console.error(
			"Error: Commit message must follow conventional commit format (e.g., 'feat: add feature', 'fix(scope): fix bug')",
		);
		process.exit(1);
	}

	if (message.length > MAX_MESSAGE_LENGTH) {
		console.error(
			`Error: Commit message must be ${MAX_MESSAGE_LENGTH} characters or less (current: ${message.length})`,
		);
		process.exit(1);
	}
}

function escapeShell(s: string): string {
	return `"${s.replace(/"/g, '\\"')}"`;
}

function stageAndCommit(files: string[], message: string): string {
	const escaped = files.map(escapeShell).join(" ");
	execSync(`git add ${escaped}`, { stdio: "inherit" });
	execSync(`git commit -m ${escapeShell(message)}`, { stdio: "inherit" });
	return execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf-8",
	}).trim();
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
		const sha = stageAndCommit(files, message);
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

	if (args.length < 2) {
		console.error("Usage: assist commit <files...> <message>");
		process.exit(1);
	}

	const message = args[args.length - 1];
	const files = args.slice(0, -1);
	const config = loadConfig();

	validateMessage(message, config);
	execCommit(files, message, config);
}
