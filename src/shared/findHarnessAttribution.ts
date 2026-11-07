const HARNESS_ATTRIBUTION_PHRASES: readonly string[] = [
	"co-authored-by: codex",
	"generated with codex",
	"generated with [codex]",
	"noreply@openai.com",
];

export function findHarnessAttribution(text: string): string | undefined {
	const lower = text.toLowerCase();
	return HARNESS_ATTRIBUTION_PHRASES.find((phrase) => lower.includes(phrase));
}
