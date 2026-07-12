type AppendOnlyFinding = { file: string; kind: "modified" | "removed" };

export function checkAppendOnly(
	baseline: ReadonlyMap<string, string>,
	current: ReadonlyMap<string, string>,
): AppendOnlyFinding[] {
	const findings: AppendOnlyFinding[] = [];
	for (const [file, content] of baseline) {
		const now = current.get(file);
		if (now === undefined) findings.push({ file, kind: "removed" });
		else if (now !== content) findings.push({ file, kind: "modified" });
	}
	return findings;
}
