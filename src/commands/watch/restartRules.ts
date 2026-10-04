const webUiPrefix = "src/commands/sessions/web/ui/";
const sessionsPrefix = "src/commands/sessions/";

export type RestartTarget = "daemon" | "webserver";

export const restartRules: {
	target: RestartTarget;
	matches: (path: string) => boolean;
	advice: string;
}[] = [
	{
		target: "webserver",
		matches: (path) => path.startsWith(webUiPrefix),
		advice: "restart the web server, then hard-reload the browser tab",
	},
	{
		target: "daemon",
		matches: (path) =>
			path.startsWith(sessionsPrefix) && !path.startsWith(webUiPrefix),
		advice: "restart the daemon",
	},
];
