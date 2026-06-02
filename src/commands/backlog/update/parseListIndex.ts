type ParsedAcIndex = { ok: true; index: number } | { ok: false; error: string };

/** Validate a 1-based acceptance-criteria index against the list length. */
export function parseListIndex(
	raw: string,
	length: number,
	label: string,
): ParsedAcIndex {
	if (!/^\d+$/.test(raw)) {
		return { ok: false, error: `${label} must be a positive integer.` };
	}
	const index = Number.parseInt(raw, 10);
	if (index < 1 || index > length) {
		return {
			ok: false,
			error: `${label} ${index} is out of range (1-${length}).`,
		};
	}
	return { ok: true, index };
}
