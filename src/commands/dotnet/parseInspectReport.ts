export type Issue = {
	typeId: string;
	file: string;
	line: number;
	message: string;
	severity: string;
};

const LEVEL_TO_SEVERITY: Record<string, string> = {
	error: "ERROR",
	warning: "WARNING",
	note: "SUGGESTION",
};

export function parseInspectReport(json: string): Issue[] {
	const sarif = JSON.parse(json);
	const results = sarif.runs?.[0]?.results;
	if (!Array.isArray(results)) return [];

	return results.map((r: SarifResult) => ({
		typeId: r.ruleId,
		file: r.locations?.[0]?.physicalLocation?.artifactLocation?.uri ?? "",
		line: r.locations?.[0]?.physicalLocation?.region?.startLine ?? 0,
		message: r.message?.text ?? "",
		severity: LEVEL_TO_SEVERITY[r.level] ?? "WARNING",
	}));
}

type SarifResult = {
	ruleId: string;
	level: string;
	message: { text: string };
	locations: {
		physicalLocation: {
			artifactLocation: { uri: string };
			region: { startLine: number };
		};
	}[];
};
