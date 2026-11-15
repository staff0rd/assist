const MIN_WIDTH = 20;

function endsInUrl(text: string): boolean {
	if (text.length < MIN_WIDTH || /\s$/.test(text)) return false;
	return /^\S+$/.test(text) || /:\/\/\S*$/.test(text);
}

function joins(above: string, below: string): boolean {
	return endsInUrl(above) && /^\S/.test(below) && !/^https?:\/\//i.test(below);
}

function isSameWidthUrlRow(above: string, below: string): boolean {
	return below.length === above.length && /^\S+$/.test(below);
}

function isCutAtSameWidthAbove(
	before: string | undefined,
	above: string,
): boolean {
	return (
		before !== undefined &&
		before.length === above.length &&
		joins(before, above)
	);
}

export function continuesHardWrap(
	before: string | undefined,
	above: string,
	below: string,
): boolean {
	if (!joins(above, below)) return false;
	return (
		isSameWidthUrlRow(above, below) || isCutAtSameWidthAbove(before, above)
	);
}
