import type { DocsFeedback } from "../../sessions/web/docsFeedback/docsFeedbackSchema";

export type DocsFeedbackMessage = DocsFeedback & {
	type: "assist-docs-feedback";
	node?: string;
};

export function isDocsFeedbackMessage(
	message: unknown,
): message is DocsFeedbackMessage {
	const { type, pageId, prompt } = (message ?? {}) as Record<string, unknown>;
	return (
		type === "assist-docs-feedback" &&
		typeof pageId === "string" &&
		typeof prompt === "string"
	);
}
