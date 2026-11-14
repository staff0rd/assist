import { activityLine } from "./activityLine";

const LEADING_CD = /^cd\s+(?:"[^"]*"|'[^']*'|\S+)\s*(?:;|&&)\s*/;

export function commandActivityLine(command: string): string {
	return activityLine(command.trim().replace(LEADING_CD, ""));
}
