type Command = { path: string[]; description: string };

export function parseCached(cli: string, cached: string): Command[] {
	const prefix = `${cli} `;
	const commands: Command[] = [];

	for (const line of cached.split("\n")) {
		const trimmed = line.replace(/^ [RW?] {2}/, "").trim();
		if (!trimmed.startsWith(prefix)) continue;

		const rest = trimmed.slice(prefix.length);
		const dashIdx = rest.indexOf(" — ");
		const pathStr = dashIdx !== -1 ? rest.slice(0, dashIdx) : rest;
		const description = dashIdx !== -1 ? rest.slice(dashIdx + 3) : "";
		commands.push({ path: pathStr.split(" "), description });
	}

	return commands;
}
