import type { RateLimits } from "../../../shared/RateLimits";
import { type SessionClient, sendTo } from "./broadcast";
import { buildHello } from "./buildHello";
import type { SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import { lifecycleHandlers } from "./lifecycleHandlers";
import type { SessionManager } from "./SessionManager";

export type Msg = Record<string, unknown>;
type Handler = (
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
) => void;

// why: a windows-origin create/resume forwards to the Windows daemon, not a local spawn
// why: isNew flags fresh spawns vs resume so the web UI toasts only on new sessions
function creator(
	isNew: boolean,
	spawn: (m: SessionManager, d: Msg) => string,
): Handler {
	return (client, m, d) => {
		if (m.windowsProxy.route(client, d)) return;
		sendTo(client, { type: "created", sessionId: spawn(m, d), isNew });
	};
}

// why: proxied (windows) sessions route to the Windows daemon, else run locally
function routed(local: Handler): Handler {
	return (client, m, d) => {
		if (!m.windowsProxy.route(client, d)) local(client, m, d);
	};
}

export const messageHandlers: Record<string, Handler> = {
	ping: (client) => sendTo(client, { type: "pong", pid: process.pid }),
	"subscribe-logs": (client, m, d) =>
		m.clients.subscribeLogs(client, d.replay !== false),
	hello: (client) => sendTo(client, buildHello()),
	create: creator(true, (m, d) =>
		m.spawn(d.prompt as string | undefined, d.cwd as string | undefined),
	),
	"create-run": creator(true, (m, d) =>
		m.spawnRun(
			d.runName as string,
			(d.runArgs as string[]) ?? [],
			d.cwd as string | undefined,
		),
	),
	"create-assist": creator(true, (m, d) =>
		m.spawnAssist(
			(d.assistArgs as string[]) ?? [],
			d.cwd as string | undefined,
			{
				title: d.title as string | undefined,
				subtitle: d.subtitle as string | undefined,
			},
		),
	),
	resume: creator(false, (m, d) =>
		m.resume(
			d.sessionId as string,
			d.cwd as string,
			d.name as string | undefined,
		),
	),
	...lifecycleHandlers,
	drain: (client, m) => sendTo(client, { type: "drained", count: m.drain() }),
	limits: (_client, m, d) => m.clients.updateLimits(d.rateLimits as RateLimits),
	usage: (_client, m, d) =>
		m.recordUsage(
			d.claudeSessionId as string,
			d.transcriptPath as string | undefined,
			d.usedPct as number | undefined,
		),
	input: routed((_client, m, d) =>
		m.writeToSession(d.sessionId as string, d.data as string),
	),
	resize: routed((_client, m, d) =>
		m.resizeSession(d.sessionId as string, d.cols as number, d.rows as number),
	),
	retry: routed((_client, m, d) => m.retrySession(d.sessionId as string)),
	restart: routed((_client, m, d) => m.restart(d.sessionId as string)),
	dismiss: routed((_client, m, d) => m.dismissSession(d.sessionId as string)),
	"set-autorun": routed((_client, m, d) =>
		m.setAutoRun(d.sessionId as string, d.enabled as boolean),
	),
	"set-autoadvance": routed((_client, m, d) =>
		m.setAutoAdvance(d.sessionId as string, d.enabled as boolean),
	),
	"set-starred": routed((_client, m, d) =>
		m.setStarred(d.sessionId as string, d.starred as boolean),
	),
	"set-active": (_client, m, d) =>
		m.active.set(d.cwd as string, d.sessionId as string),
	"set-status": (client, m, d) => {
		daemonLog(`set-status received: id=${d.sessionId} status=${d.status}`);
		if (!m.windowsProxy.route(client, d))
			m.setStatus(d.sessionId as string, d.status as SessionStatus);
	},
	"ui-status": (_client, _m, d) =>
		daemonLog(`ui rendered: id=${d.sessionId} status=${d.status}`),
};
