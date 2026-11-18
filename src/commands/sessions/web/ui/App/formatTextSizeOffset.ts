export function formatTextSizeOffset(offset: number): string {
	if (offset > 0) return `+${offset}`;
	if (offset < 0) return `−${-offset}`;
	return "0";
}
