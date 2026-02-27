const SHELL_OPERATORS = new Set(["|", ">", ">>", ";", "&&", "||"]);

function isShellBreak(token: string): boolean {
	return token.startsWith("-") || SHELL_OPERATORS.has(token);
}

function looksLikeArgument(token: string): boolean {
	return /[/=.]/.test(token) || /^\d+$/.test(token);
}

export function extractVerb(
	command: string,
	readVerbs: string[],
): string | undefined {
	const tokens = command.split(/\s+/);

	// Forward pass: find first known read verb before flags/shell operators
	for (let i = 1; i < tokens.length; i++) {
		if (isShellBreak(tokens[i])) break;
		if (readVerbs.includes(tokens[i])) return tokens[i];
	}

	// Reverse pass: find last word that looks like a verb
	for (let i = tokens.length - 1; i >= 1; i--) {
		const token = tokens[i];
		if (isShellBreak(token) || looksLikeArgument(token)) continue;
		return token;
	}

	return undefined;
}
