import { routed } from "./routed";
import { setSessionCwd } from "./setSessionCwd";
import * as sessionIo from "./writeToSession";

export const sessionSettingHandlers = {
	"set-autorun": routed((_client, m, d) =>
		m.setAutoRun(d.sessionId as string, d.enabled as boolean),
	),
	"set-autoadvance": routed((_client, m, d) =>
		m.update((sessions) =>
			sessionIo.setAutoAdvance(
				sessions,
				d.sessionId as string,
				d.enabled as boolean,
			),
		),
	),
	rename: routed((_client, m, d) =>
		m.setTitle(d.sessionId as string, (d.title as string) ?? ""),
	),
	"set-cwd": routed((_client, m, d) =>
		m.update((sessions) =>
			setSessionCwd(sessions, d.sessionId as string, d.cwd as string),
		),
	),
	"set-starred": routed((_client, m, d) =>
		m.update((sessions) =>
			sessionIo.setStarred(
				sessions,
				d.sessionId as string,
				d.starred as boolean,
			),
		),
	),
};
