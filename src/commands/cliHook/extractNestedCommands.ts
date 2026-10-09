type Visit = (i: number, inDouble: boolean) => number | undefined;

export function extractNestedCommands(command: string): string[] {
	const bodies: string[] = [];

	scanUnquoted(command, 0, (i, inDouble) => {
		const opener = openerLength(command, i, inDouble);
		if (opener === undefined) return undefined;
		const start = i + opener;
		const end =
			command[i] === "`"
				? findClosingBacktick(command, start)
				: findClosingParen(command, start);
		const body = command.slice(start, end);
		bodies.push(body, ...extractNestedCommands(body));
		return end;
	});

	return bodies;
}

function openerLength(
	command: string,
	i: number,
	inDouble: boolean,
): number | undefined {
	if (command[i] === "$" && command[i + 1] === "(") return 2;
	if (command[i] === "`") return 1;
	if (command[i] === "(" && !inDouble) return 1;
	return undefined;
}

function findClosingBacktick(command: string, start: number): number {
	const end = command.indexOf("`", start);
	return end === -1 ? command.length : end;
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
