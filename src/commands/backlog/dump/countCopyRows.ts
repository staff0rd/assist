/**
 * Count the rows in a COPY text payload. Each row is terminated by a single
 * newline (embedded newlines in values are escaped as `\n`), so counting `\n`
 * bytes yields the exact row count; an empty payload is zero rows.
 */
export function countCopyRows(data: Buffer): number {
	let rows = 0;
	let index = data.indexOf(0x0a);
	while (index !== -1) {
		rows++;
		index = data.indexOf(0x0a, index + 1);
	}
	return rows;
}
