/**
 * LinkedIn activity ids are Snowflake-style: the high 41 bits of the numeric id
 * are the creation time in epoch milliseconds. Shift off the low 22 bits to
 * recover the post's date. Returns an ISO string, or undefined for a missing or
 * non-numeric urn.
 */
export function activityUrnDate(urn: string | undefined): string | undefined {
	if (!urn) return undefined;
	const id = urn.split(":").pop();
	if (!id || !/^\d+$/.test(id)) return undefined;
	return new Date(Number(BigInt(id) >> 22n)).toISOString();
}
