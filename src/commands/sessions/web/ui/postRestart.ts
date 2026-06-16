export type RestartTarget = "daemon" | "webserver" | "both";

export const RESTART_ITEMS: {
	target: RestartTarget;
	label: string;
	message: string;
}[] = [
	{
		target: "daemon",
		label: "Restart daemon",
		message:
			"This restarts the sessions daemon. Running claude sessions will resume.",
	},
	{
		target: "webserver",
		label: "Restart webserver",
		message:
			"This restarts the web server. The connection will drop briefly while it comes back.",
	},
	{
		target: "both",
		label: "Restart both",
		message:
			"This restarts the sessions daemon and the web server. The connection will drop briefly while it comes back.",
	},
];

export function postRestart(target: RestartTarget): Promise<Response> {
	return fetch(`/api/restart?target=${target}`, { method: "POST" });
}
