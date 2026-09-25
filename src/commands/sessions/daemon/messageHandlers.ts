import type { HarnessKind } from "../../../shared/harnesses";
import type { RateLimits } from "../../../shared/RateLimits";
import { sendTo } from "./broadcast";
import { buildHello } from "./buildHello";
import { creator } from "./creator";
import { daemonLog } from "./daemonLog";
import { handleCreateRun } from "./handleCreateRun";
import { handleSetStatus } from "./handleSetStatus";
import { lifecycleHandlers } from "./lifecycleHandlers";
import { type Handler, routed } from "./routed";
import { sessionSettingHandlers } from "./sessionSettingHandlers";
import { spawnContextFrom } from "./spawnContextFrom";
import { spawnCreate } from "./spawnCreate";

export type { Msg } from "./routed";

export const messageHandlers: Record<string, Handler> = {
	ping: (client) => sendTo(client, { type: "pong", pid: process.pid }),
	"subscribe-logs": (client, m, d) =>
		m.clients.subscribeLogs(client, d.replay !== false),
	hello: (client) => sendTo(client, buildHello()),
	create: creator(true, spawnCreate),
	"create-run": handleCreateRun,
	"create-assist": creator(true, (m, d) =>
		m.spawnAssist(
			(d.assistArgs as string[]) ?? [],
			d.cwd as string | undefined,
			{
				title: d.title as string | undefined,
				subtitle: d.subtitle as string | undefined,
				inPlace: d.inPlace === true,
			},
			spawnContextFrom(d),
		),
	),
	resume: creator(false, (m, d) =>
		m.resume(
			d.sessionId as string,
			d.cwd as string,
			d.name as string | undefined,
			d.harness as HarnessKind | undefined,
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
	retry: routed((client, m, d) => {
		const conflict = m.retrySession(d.sessionId as string, d.replace === true);
		if (conflict)
			sendTo(client, {
				type: "run-conflict",
				sessionId: d.sessionId,
				existing: conflict,
			});
	}),
	restart: routed((client, m, d) => {
		const result = m.restart(d.sessionId as string);
		if (!result.ok && result.reason)
			sendTo(client, { type: "error", message: result.reason });
	}),
	dismiss: routed((_client, m, d) => m.dismissSession(d.sessionId as string)),
	discard: routed((_client, m, d) => m.discardSession(d.sessionId as string)),
	stop: routed((_client, m, d) => m.stopSession(d.sessionId as string)),
	...sessionSettingHandlers,
	"set-active": (_client, m, d) =>
		m.active.set(d.cwd as string, d.sessionId as string),
	"set-status": handleSetStatus,
	"verify-started": routed((client, m, d) =>
		m.verify.start(client, d.sessionId as string),
	),
	"pr-preview": (client, m, d) => m.prPreview.set(client, d),
	"pr-decision": routed((_client, m, d) => m.prPreview.decide(d)),
	"ui-status": (_client, _m, d) =>
		daemonLog(`ui rendered: id=${d.sessionId} status=${d.status}`),
};
