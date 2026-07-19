import { extractBacklogIds } from "../commands/sessions/summarise/scanSessionBacklogRefs";

export function findBacklogRefs(text: string): number[] {
	return [...new Set(extractBacklogIds(text))];
}

export function backlogRefError(
	subject: string,
	context: string,
	ids: number[],
): string {
	const refs = ids.map((id) => `a${id}`).join(", ");
	return `Error: ${subject} must not reference assist backlog items (found ${refs}). Do not include assist references or backlog numbers in ${context} — the backlog item links to your work, not the other way around.`;
}
