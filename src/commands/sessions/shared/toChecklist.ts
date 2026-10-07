import type {
	PreviewChecklistItem,
	PreviewChecklistNote,
} from "./PreviewDecision";

export function toChecklist(
	value: unknown,
): PreviewChecklistItem[] | undefined {
	if (!Array.isArray(value)) return undefined;
	return value.flatMap((entry) => {
		const { id, ticked, comment, notes } = (entry ?? {}) as Record<
			string,
			unknown
		>;
		if (typeof id !== "string") return [];
		const parsedNotes = toNotes(notes);
		return [
			{
				id,
				ticked: ticked === true,
				...(typeof comment === "string" && comment !== "" ? { comment } : {}),
				...(parsedNotes.length > 0 ? { notes: parsedNotes } : {}),
			},
		];
	});
}

function toNotes(value: unknown): PreviewChecklistNote[] {
	if (!Array.isArray(value)) return [];
	return value.flatMap((entry) => {
		const { id, comment } = (entry ?? {}) as Record<string, unknown>;
		if (typeof id !== "string" || typeof comment !== "string" || !comment)
			return [];
		return [{ id, comment }];
	});
}
