import { consumeMarker } from "./consumeMarker";
import { simulatedDivergencePath } from "./simulatedDivergencePath";

export function consumeSimulatedDivergence(cwd?: string): boolean {
	try {
		return consumeMarker(simulatedDivergencePath(cwd));
	} catch {
		return false;
	}
}
