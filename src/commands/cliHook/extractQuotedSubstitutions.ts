type Visit = (i: number, inDouble: boolean) => number | undefined;

export function extractQuotedSubstitutions(command: string): string[] {
	const bodies: string[] = [];

	scanUnquoted(command, 0, (i, inDouble) => {
		if (!inDouble) return undefined;
		if (command[i] === "$" && command[i + 1] === "(") {
			const end = findClosingParen(command, i + 2);
			bodies.push(command.slice(i + 2, end));
			return end;
		}
		if (command[i] === "`") {
			const end = command.indexOf("`", i + 1);
			const stop = end === -1 ? command.length : end;
			bodies.push(command.slice(i + 1, stop));
			return stop;
		}
		return undefined;
	});

	return bodies;
}

function findClosingParen(command: string, start: number): number {
	let depth = 1;
	let close = command.length;

	scanUnquoted(command, start, (i, inDouble) => {
		if (inDouble) return undefined;
		if (command[i] === "(") depth++;
		else if (command[i] === ")" && --depth === 0) {
			close = i;
			return command.length;
		}
		return undefined;
	});

	return close;
}

function scanUnquoted(command: string, start: number, visit: Visit): void {
	let inSingle = false;
	let inDouble = false;

	for (let i = start; i < command.length; i++) {
		const ch = command[i];
		if (ch === "\\" && !inSingle) i++;
		else if (ch === "'" && !inDouble) inSingle = !inSingle;
		else if (ch === '"' && !inSingle) inDouble = !inDouble;
		else if (!inSingle) i = visit(i, inDouble) ?? i;
	}
}
