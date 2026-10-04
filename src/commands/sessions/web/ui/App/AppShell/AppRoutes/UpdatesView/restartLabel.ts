import type { RestartTarget } from "../../../../../../../watch/restartRules";

export function restartLabel(target: RestartTarget): string {
	return target === "webserver" ? "web server" : "daemon";
}
