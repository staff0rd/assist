export function appendToDraft(draft: string, text: string): string {
	const kept = draft.trimEnd();
	return kept ? `${kept}\n\n${text}` : text;
}
