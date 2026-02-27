/** Shell-aware tokenizer that respects single and double quotes. */
export function tokenize(command: string): string[] {
	const tokens: string[] = [];
	let current = "";
	let inSingle = false;
	let inDouble = false;

	for (let i = 0; i < command.length; i++) {
		const ch = command[i];

		if (ch === "'" && !inDouble) {
			inSingle = !inSingle;
			current += ch;
		} else if (ch === '"' && !inSingle) {
			inDouble = !inDouble;
			current += ch;
		} else if (ch === "\\" && inDouble && i + 1 < command.length) {
			current += ch + command[++i];
		} else if (/\s/.test(ch) && !inSingle && !inDouble) {
			if (current) {
				tokens.push(current);
				current = "";
			}
		} else {
			current += ch;
		}
	}

	if (current) tokens.push(current);
	return tokens;
}
