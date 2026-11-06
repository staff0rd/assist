import type { TesterState } from "./TestflightTesters";

const states: Record<string, TesterState> = {
	NOT_INVITED: "not-invited",
	INVITED: "invited",
	ACCEPTED: "accepted",
	INSTALLED: "installed",
	REVOKED: "revoked",
};

export function toTesterState(state: unknown): TesterState {
	return states[String(state)] ?? "not-invited";
}
