export type RestartTarget = "daemon" | "webserver" | "both";

export const RESTART_ITEM: {
	target: RestartTarget;
	label: string;
	message: string;
} = {
	target: "both",
	label: "Restart daemon",
	message:
		"This restarts the sessions daemon and the web server, then reloads the page once the server is back.",
};

export function postRestart(target: RestartTarget): Promise<Response> {
	return fetch(`/api/restart?target=${target}`, { method: "POST" });
}
