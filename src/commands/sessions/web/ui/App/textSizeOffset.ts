export const MIN_TEXT_SIZE_OFFSET = -4;
export const MAX_TEXT_SIZE_OFFSET = 8;

export function textSizeOffset(raw: unknown): number {
	if (typeof raw !== "number" || !Number.isFinite(raw)) return 0;
	return Math.max(
		MIN_TEXT_SIZE_OFFSET,
		Math.min(MAX_TEXT_SIZE_OFFSET, Math.round(raw)),
	);
}
