const LEGACY_ADVICE_SECTIONS = ["editing-files"];

export function stripLegacyAdviceKeys(advice: unknown): unknown {
	if (!advice || typeof advice !== "object") return advice;
	const { sections } = advice as Record<string, unknown>;
	if (!sections || typeof sections !== "object") return advice;
	const rest = { ...(sections as Record<string, unknown>) };
	for (const key of LEGACY_ADVICE_SECTIONS) delete rest[key];
	return { ...advice, sections: rest };
}
