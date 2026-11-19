import { missingToolMessage } from "../sessions/daemon/worktree/missingToolMessage";

const NOT_FOUND_PATTERNS = [
	/([^\s:]+): command not found/,
	/'([^']+)' is not recognized as an internal or external command/,
];

function toolNamedInOutput(output: string): string | undefined {
	for (const pattern of NOT_FOUND_PATTERNS) {
		const match = output.match(pattern);
		if (match) return match[1];
	}
	return undefined;
}

export function missingBuildTool(
	command: string,
	exitCode: number,
	output: string,
): string | null {
	return missingToolMessage(toolNamedInOutput(output) ?? command, exitCode);
}
