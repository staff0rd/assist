import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { spawnClaudeSdk } from "../spawnClaudeSdk";
import { linkWorkflowQuery } from "./linkWorkflowQuery";
import { refuseSdkLaunch } from "./refuseSdkLaunch";

const optional = (value: unknown) =>
	typeof value === "string" && value ? value : undefined;

const stringRecord = (value: unknown): Record<string, string> =>
	Object.fromEntries(
		Object.entries(value && typeof value === "object" ? value : {}).filter(
			(entry): entry is [string, string] => typeof entry[1] === "string",
		),
	);

export const handleSdkLaunch: Handler = (client, m, d) => {
	const sessionId = String(d.sessionId);
	m.clients.delete(client);
	const session = m.session(sessionId);
	const attach = session?.pty?.sdk?.attach;
	if (!attach) {
		refuseSdkLaunch(
			client,
			sessionId,
			session ? "is not a Claude (SDK) workflow session" : "was not found",
		);
		return;
	}
	const prompt = optional(d.prompt);
	const resumeId = optional(d.resumeId);
	daemonLog(
		`session ${sessionId} sdk-launch received: ${resumeId ? `resume ${resumeId}` : `claude session ${optional(d.conversationId) ?? "unassigned"}`}${prompt ? "" : ", no prompt"}`,
	);
	let query: SessionProcess;
	try {
		query = spawnClaudeSdk({
			prompt,
			cwd: optional(d.cwd),
			sessionId,
			claudeSessionId: optional(d.conversationId),
			resumeId,
			model: optional(d.model),
			launcherEnv: stringRecord(d.env),
		});
	} catch (error) {
		refuseSdkLaunch(
			client,
			sessionId,
			error instanceof Error ? error.message : String(error),
		);
		return;
	}
	attach(query, !prompt);
	linkWorkflowQuery(client, sessionId, query);
};
