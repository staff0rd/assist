export function useSpinnerUi(verbose: boolean): boolean {
	if (verbose) return false;
	return Boolean(process.stdout.isTTY);
}
