import { escapeHtml } from "./escapeHtml";
export function highlight(text: string, reference: string): string {
	const at = text.indexOf(reference);
	return `${escapeHtml(text.slice(0, at))}<span class="issue-ref">${escapeHtml(reference)}</span>${escapeHtml(text.slice(at + reference.length))}`;
}
