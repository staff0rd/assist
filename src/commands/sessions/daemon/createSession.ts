import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { preassignedId } from "../../../shared/harnessAdapters/preassignedId";
import type { HarnessKind } from "../../../shared/harnesses";
import { type ServerRunMeta, serverRunMeta } from "./serverRunMeta";
import { spawnRun } from "./spawnRun";
import { startOrHoldPty } from "./startOrHoldPty";
import type { Session } from "./types";
import { sessionBase } from "./sessionBase";

export type { Session, SessionInfo, SessionStatus } from "./types";

export type CreateSessionOpts = {
	prompt?: string;
	cwd?: string;
	design?: boolean;
	auto?: boolean;
	harness?: HarnessKind;
	holdPty?: boolean;
};

export function createSession(
	id: string,
	{ prompt, cwd, design, auto, harness, holdPty }: CreateSessionOpts = {},
): Session {
	const adapter = harnessAdapter(harness);
	/* why: assign the claude conversation id up front so the card binds to the
	 * transcript this process writes, not the newest unclaimed .jsonl in the cwd
	 * (which races concurrent sessions in the same repo) (#413). */
	const conversationId = preassignedId(adapter);
	/* why: a session with no initial prompt opens idle, awaiting the user's first
	 * input — no Claude Code hook fires until they submit, so it must start
	 * waiting rather than the default running, which would otherwise stick until
	 * the first turn's Stop (#449). A prompted session is working immediately. */
	return {
		...sessionBase(id, prompt ? "running" : "waiting"),
		name: `Session ${id}`,
		commandType: "claude",
		...adapter.activityIdentity(conversationId),
		...startOrHoldPty(
			() =>
				adapter.interactive({
					prompt,
					cwd,
					sessionId: id,
					conversationId,
					design,
					auto,
				}),
			holdPty,
		),
		cwd,
		initialPrompt: prompt,
		design,
		auto,
	};
}

export type RunSpawnRequest = {
	runName: string;
	runArgs: string[];
	cwd?: string;
	meta?: ServerRunMeta;
};

export function createRunSession(
	id: string,
	{ runName, runArgs, cwd, meta }: RunSpawnRequest,
): Session {
	const serverMeta = meta ?? serverRunMeta(runName, cwd);
	return {
		...sessionBase(id, "running"),
		name: `run: ${runName}`,
		commandType: "run",
		pty: spawnRun({ name: runName, args: runArgs, cwd }),
		runName,
		runArgs,
		cwd,
		server: serverMeta.server || undefined,
		serverPort: serverMeta.port,
		serverProtocol: serverMeta.protocol,
		serverPath: serverMeta.path,
		serverOrigin: serverMeta.origin,
		serverGroup: serverMeta.group,
	};
}
