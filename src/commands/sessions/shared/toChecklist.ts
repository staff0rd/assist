import type { PreviewChecklistItem } from "./PreviewDecision";

export function toChecklist(
	value: unknown,
): PreviewChecklistItem[] | undefined {
	if (!Array.isArray(value)) return undefined;
	return value.flatMap((entry) => {
		const { id, ticked, comment, slice } = (entry ?? {}) as Record<
			string,
			unknown
		>;
		if (typeof id !== "string") return [];
		return [
			{
				id,
				ticked: ticked === true,
				...(typeof comment === "string" && comment !== "" ? { comment } : {}),
				...(typeof slice === "number" && Number.isInteger(slice)
					? { slice }
					: {}),
			},
		];
	});
}
