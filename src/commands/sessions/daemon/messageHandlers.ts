import type { HarnessKind } from "../../../shared/harnesses";
import type { RateLimits } from "../../../shared/RateLimits";
import { handleAutoUpdate } from "./autoUpdate/handleAutoUpdate";
import { handleAutoUpdateControl } from "./autoUpdate/handleAutoUpdateControl";
import { sendTo } from "./broadcast";
import { handleHelloRequest } from "./handleHelloRequest";
import { handleDeferCommand } from "./handleDeferCommand";
import { handleDequeue } from "./handleDequeue";
import { handleInterrupt } from "./handleInterrupt";
import { handleSdkLaunch } from "./sdk/handleSdkLaunch";
import { handleSdkShell } from "./shell/handleSdkShell";
import { handleWebLog } from "./handleWebLog";
import { handleSearchHistory } from "./historySearch/handleSearchHistory";
import { creator } from "./creator";
import { daemonLog } from "./daemonLog";
import { handleCodexUsage } from "./handleCodexUsage";
import { handleCreateRun } from "./handleCreateRun";
import { handleDismiss } from "./handleDismiss";
import { handleOutputRequest } from "./handleOutputRequest";
import { handleReloadLinks } from "./handleReloadLinks";
import { handleRestartWebServer } from "./handleRestartWebServer";
import { handleSetStatus } from "./handleSetStatus";
import { handleSubscribeLogs } from "./handleSubscribeLogs";
import { handleTypePrompt } from "./handleTypePrompt";
import { handleTypePromptToWriter } from "./handleTypePromptToWriter";
import { inboxHandlers } from "./inbox/inboxHandlers";
import { handleUserActivity } from "./handleUserActivity";
import { lifecycleHandlers } from "./lifecycleHandlers";
import { pinHandlers } from "./pins/pinHandlers";
import { retryHandlers } from "./retryHandlers";
import { type Handler, routed } from "./routed";
import { viewerHandlers } from "./viewerHandlers";
import { sessionSettingHandlers } from "./sessionSettingHandlers";
import { spawnAssistCreate } from "./spawnAssistCreate";
import { spawnCreate } from "./spawnCreate";
import {
	handleCancelTransfer,
	handleTransfer,
} from "./transfer/handleTransfer";

export type { Msg } from "./routed";

export const messageHandlers: Record<string, Handler> = {
	ping: (client) => sendTo(client, { type: "pong", pid: process.pid }),
	"subscribe-logs": handleSubscribeLogs,
	"restart-webserver": handleRestartWebServer,
	"web-log": handleWebLog,
	hello: handleHelloRequest,
	output: handleOutputRequest,
	nodes: (client, m) => m.links.sendNodes(client),
	"auto-update": handleAutoUpdate,
	"auto-update-control": handleAutoUpdateControl,
	"search-history": (client, _m, d) => handleSearchHistory(client, d),
	...inboxHandlers,
	"reload-links": handleReloadLinks,
	create: creator(true, spawnCreate),
	"create-run": handleCreateRun,
	"create-assist": creator(true, spawnAssistCreate),
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
	"codex-usage": handleCodexUsage,
	...viewerHandlers,
	...pinHandlers,
	"type-prompt": handleTypePrompt,
	"sdk-launch": handleSdkLaunch,
	"sdk-shell": handleSdkShell,
	"type-prompt-to-writer": handleTypePromptToWriter,
	...retryHandlers,
	dismiss: handleDismiss,
	discard: routed((_client, m, d) => m.discardSession(d.sessionId as string)),
	stop: routed((_client, m, d) => m.stopSession(d.sessionId as string)),
	interrupt: handleInterrupt,
	dequeue: handleDequeue,
	transfer: handleTransfer,
	"cancel-transfer": handleCancelTransfer,
	...sessionSettingHandlers,
	"set-active": (_client, m, d) =>
		m.active.set(d.cwd as string, d.sessionId as string),
	"set-status": handleSetStatus,
	"verify-started": routed((client, m, d) =>
		m.verify.start(client, d.sessionId as string),
	),
	"session-live": (client, m, d) => {
		const live = m.hasSession(d.sessionId as string);
		if (!live) daemonLog(`session-live: unknown session id=${d.sessionId}`);
		sendTo(client, { type: "session-live", live });
	},
	"pr-preview": (client, m, d) => m.prPreview.set(client, d),
	"defer-command": handleDeferCommand,
	"pr-decision": routed((_client, m, d) => m.prPreview.decide(d)),
	"user-activity": handleUserActivity,
	"ui-status": (_client, _m, d) =>
		daemonLog(`ui rendered: id=${d.sessionId} status=${d.status}`),
};
