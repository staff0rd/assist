import type { AssistConfig } from "../../shared/types";

const MAX_MESSAGE_LENGTH = 50;
const CONVENTIONAL_COMMIT_REGEX =
	/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(!)?(\(.+\))?!?: .+$/;

export function validateMessage(message: string, config: AssistConfig): void {
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
