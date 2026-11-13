type Elsewhere = { changes: number; unknown: boolean; pages: number };

function plural(count: number, noun: string) {
	return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function remainingStatus(leftHere: number, elsewhere: Elsewhere) {
	const changes = leftHere + elsewhere.changes;
	const pages = elsewhere.pages + (leftHere > 0 ? 1 : 0);
	if (changes === 0) return "All changes done";
	const count = `${changes}${elsewhere.unknown ? "+" : ""}`;
	return `${count} left on ${plural(pages, "page")}`;
}
