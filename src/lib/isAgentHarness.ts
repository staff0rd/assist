import { activeHarness } from "./activeHarness";

export function isAgentHarness(): boolean {
	return activeHarness() !== undefined;
}
