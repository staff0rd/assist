/**
 * Parse the timestamp encoded in an archived handover filename
 * (`YYYY-MM-DDTHHMMSSZ[-suffix].md`, the inverse of the old archive writer's
 * formatting). Returns `undefined` when the name does not begin with such a
 * timestamp.
 */
export function parseArchiveTimestamp(filename: string): Date | undefined {
	const match = filename.match(
		/^(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
	);
	if (!match) return undefined;
	const [, year, month, day, hour, minute, second] = match;
	return new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
}
