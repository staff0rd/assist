const COMMAND_NOT_FOUND_EXIT_CODES = new Set([127, 9009]);

const INSTALL_HINTS: Record<string, string> = {
	pnpm: "npm install -g pnpm (or: corepack enable pnpm)",
	yarn: "npm install -g yarn (or: corepack enable yarn)",
	bun: "npm install -g bun",
};

export function missingToolMessage(
	command: string,
	code: number | null,
): string | null {
	if (code === null || !COMMAND_NOT_FOUND_EXIT_CODES.has(code)) return null;
	const tool = command.trim().split(/\s+/)[0];
	const hint = INSTALL_HINTS[tool];
	return hint
		? `${tool} is not installed; install it with: ${hint}`
		: `${tool} is not installed`;
}
