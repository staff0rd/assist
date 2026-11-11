import { harnessEnvironmentMarkers } from "../shared/harnessAdapters/harnessEnvironmentMarkers";
import { type HarnessKind, harnesses } from "../shared/harnesses";

let declaredByHookEntryPoint: HarnessKind | undefined;

export function markActiveHarness(harness: HarnessKind | undefined): void {
	declaredByHookEntryPoint = harness;
}

function declaredByLaunch(): HarnessKind | undefined {
	const declared = process.env.ASSIST_HARNESS;
	return declared && Object.hasOwn(harnesses, declared)
		? (declared as HarnessKind)
		: undefined;
}

export function activeHarness(): HarnessKind | undefined {
	if (declaredByHookEntryPoint) return declaredByHookEntryPoint;
	const detected = (
		Object.keys(harnessEnvironmentMarkers) as HarnessKind[]
	).find((kind) => harnessEnvironmentMarkers[kind]?.());
	return detected ?? declaredByLaunch();
}
