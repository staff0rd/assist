export function serializeManualChecks(
	manualCheck: string[] | undefined,
): string | null {
	return manualCheck && manualCheck.length > 0
		? JSON.stringify(manualCheck)
		: null;
}
