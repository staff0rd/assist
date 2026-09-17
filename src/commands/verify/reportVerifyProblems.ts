export function verifySection(
	label: string,
	entries: string[],
): string | undefined {
	if (entries.length === 0) return undefined;
	const list = entries
		.sort()
		.map((entry) => `  ${entry}`)
		.join("\n");
	return `${label}:\n${list}`;
}

export function reportVerifyProblems(
	problems: (string | undefined)[],
	success: string,
): never {
	const found = problems.filter(
		(problem): problem is string => problem !== undefined,
	);

	if (found.length > 0) {
		console.log(found.join("\n\n"));
		process.exit(1);
	}

	console.log(success);
	process.exit(0);
}
