let pinnedPr: number | undefined;

export function pinCurrentPr(prNumber: number): void {
	pinnedPr = prNumber;
}

export function getPinnedPr(): number | undefined {
	return pinnedPr;
}

export function currentPrSelector(currentBranch: () => string): string {
	return pinnedPr === undefined ? currentBranch() : String(pinnedPr);
}
