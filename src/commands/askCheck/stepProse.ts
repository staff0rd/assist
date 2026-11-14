export function stepProse(step: string): string {
	return step.replace(/`[^`]+`/g, "");
}
