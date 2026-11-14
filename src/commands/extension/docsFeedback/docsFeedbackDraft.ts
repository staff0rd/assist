import type { DocsFeedback } from "../../sessions/web/docsFeedback/docsFeedbackSchema";

const KEY = "assist-docs-feedback-draft";

function isDraft(value: unknown): value is DocsFeedback {
	const draft = (value ?? {}) as Record<string, unknown>;
	return ["pageId", "heading", "source", "selection", "prompt"].every(
		(key) => typeof draft[key] === "string",
	);
}

function save(draft: DocsFeedback): void {
	try {
		sessionStorage.setItem(KEY, JSON.stringify(draft));
	} catch {}
}

function clear(): void {
	try {
		sessionStorage.removeItem(KEY);
	} catch {}
}

function load(pageId: string): DocsFeedback | undefined {
	try {
		const draft: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
		return isDraft(draft) && draft.pageId === pageId ? draft : undefined;
	} catch {
		return undefined;
	}
}

export const docsFeedbackDraft = { save, clear, load };
