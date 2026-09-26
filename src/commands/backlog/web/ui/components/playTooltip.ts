export function playTooltip(inFlight: boolean, unavailableOn?: string): string {
	if (unavailableOn) return `Not cloned on ${unavailableOn}`;
	return inFlight
		? "Already running — close that session to run it again"
		: "Build";
}
