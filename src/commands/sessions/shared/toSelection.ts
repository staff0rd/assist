import type { PreviewSelection } from "./PreviewDecision";

export function toSelection(value: unknown): PreviewSelection | undefined {
	const selection = value as PreviewSelection | undefined;
	if (
		typeof selection?.topLeft !== "string" ||
		typeof selection.bottomRight !== "string"
	)
		return undefined;
	return { topLeft: selection.topLeft, bottomRight: selection.bottomRight };
}
