import { legacyDefaultHarness } from "../../shared/harnessLabel";

export function phaseUnlockSuffix(harness?: string): string {
	return !harness || harness === legacyDefaultHarness ? "" : `:${harness}`;
}

export function phaseUnlockRef(phase: number, harness?: string): string {
	return `phase-${phase}${phaseUnlockSuffix(harness)}`;
}
