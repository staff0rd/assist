// assist-maintainability-override: 60
import type { HarnessKind } from "../../../shared/harnesses";
import { ActiveSelection } from "./ActiveSelection";
import type { SessionClient } from "./broadcast";
import { broadcastSessions } from "./broadcastSessions";
import { ClientHub, persistUsagePeak } from "./ClientHub";
import type { AssistSessionMeta } from "./createAssistSession";
import {
	createRunSession,
	type RunSpawnRequest,
	type Session,
	type SessionInfo,
} from "./createSession";
import { dismissSessionGated } from "./dismissSessionGated";
import { drainSessions } from "./drainSessions";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import { greetClient } from "./greetClient";
import { PrPreviewCoordinator } from "./PrPreviewCoordinator";
import { makeSessionSpawner } from "./makeSessionSpawner";
import { applyUsageRecord } from "./applyUsageRecord";
import { makeStatusChangeHandler } from "./makeStatusChangeHandler";
import { type HookStatusReport, setStatusFromHook } from "./setStatusFromHook";
import {
	restartManagedSession,
	type RestartResult,
} from "./restartManagedSession";
import { releaseClient } from "./releaseClient";
import { restoreAllSessions } from "./restoreAllSessions";
import type { ServerConflictInfo } from "./serverConflictInfo";
import { runRetry } from "./runRetry";
import { liveServerRun, stopServerSession } from "./liveServerRun";
import { reuseSessionForRun } from "./reuseSessionForRun";
import { setSessionTitle } from "./setSessionTitle";
import { shutdownSessions } from "./shutdownSessions";
import { toSessionInfo } from "./toSessionInfo";
import { treeSpawnContext } from "./treeSpawnContext";
import { VerifyTracker } from "./VerifyTracker";
import { WindowsProxy } from "./WindowsProxy";
import type { SpawnContext } from "./types";
import { addAgentToStream } from "./worktree/addAgentToStream";
import type { AddAgentRequest } from "./worktree/spawnIntoStream";
import {
	type CreateSpawnRequest,
	spawnAssistInTree,
	spawnInTree,
	type TreeSpawnContext,
} from "./worktree/spawnInTree";
import * as sessionIo from "./writeToSession";
import { resumeInTree } from "./worktree/resumeInTree";

export class SessionManager {
	private sessions = new Map<string, Session>();
	readonly prPreview = new PrPreviewCoordinator(this.sessions, () =>
		this.notify(),
	);
	// why: dispatch calls active.set() on card click; broadcasts include active.toJSON()
	readonly active = new ActiveSelection(() => this.notify());
	readonly verify = new VerifyTracker(this.sessions, () => this.notify());
	readonly clients = new ClientHub(persistUsagePeak);
	private readonly idCounter = { next: 1 };
	private shuttingDown = false;

	// why: dispatch calls windowsProxy.route() to forward windows-origin sessions
	readonly windowsProxy = new WindowsProxy(this.clients, () => this.notify());

	constructor(private readonly onIdleChange?: (idle: boolean) => void) {}

	addClient(client: SessionClient): void {
		this.clients.add(client);
		// why: notify sends the sessions list with the active selection in one message, avoiding a first-card race before greetClient
		this.notify();
		greetClient(client, this.sessions, this.windowsProxy);
	}

	removeClient(client: SessionClient): void {
		releaseClient(client, this.clients, this.prPreview, this.verify);
		this.onIdleChange?.(this.isIdle());
	}

	isIdle = (): boolean => this.sessions.size === 0 && this.clients.size === 0;

	shutdown(): void {
		this.shuttingDown = true;
		shutdownSessions(this.sessions);
	}

	async flushActiveMs(): Promise<void> {
		await Promise.all(
			[...this.sessions.values()].map((s) => flushPhaseActiveMs(s)),
		);
	}

	restore(): string[] {
		return restoreAllSessions(this.spawner, this.sessions, this.notify);
	}

	drain = (): number => drainSessions(this.sessions, this.notify);

	private readonly spawner = makeSessionSpawner(
		this.sessions,
		this.clients,
		this.idCounter,
		() => this.onStatusChange,
		() => this.notify(),
	);

	private readonly spawnWith = this.spawner.spawn;

	private treeCtx(): TreeSpawnContext {
		return treeSpawnContext(
			this.sessions,
			this.spawnWith,
			this.notify,
			this.clients,
			this.onStatusChange,
		);
	}

	spawn(request: CreateSpawnRequest = {}, context?: SpawnContext): string {
		return spawnInTree(this.treeCtx(), request, context);
	}

	addAgent(targetId: string, request: AddAgentRequest = {}) {
		return addAgentToStream(this.treeCtx(), targetId, request);
	}

	spawnRun(request: RunSpawnRequest, context?: SpawnContext): string {
		return this.spawnWith((id) => createRunSession(id, request), context);
	}

	liveServerRun(origin: string, excludeId?: string): Session | undefined {
		return liveServerRun(this.sessions, origin, excludeId);
	}

	spawnAssist(
		assistArgs: string[],
		cwd?: string,
		meta?: AssistSessionMeta,
		context?: SpawnContext,
	): string {
		return spawnAssistInTree(this.treeCtx(), assistArgs, cwd, meta, context);
	}

	resume(
		sessionId: string,
		cwd: string,
		name?: string,
		harness?: HarnessKind,
	): string {
		return resumeInTree(this.treeCtx(), sessionId, cwd, name, harness);
	}

	private readonly onStatusChange = makeStatusChangeHandler(
		this.sessions,
		(id) => this.dismissSession(id),
		() => this.notify(),
		(session, itemId) =>
			reuseSessionForRun(
				session,
				itemId,
				this.clients,
				this.onStatusChange,
				this.treeCtx(),
			),
	);

	writeToSession(id: string, data: string): void {
		sessionIo.writeToSession(this.sessions, id, data, this.onStatusChange);
	}

	resizeSession(id: string, cols: number, rows: number): void {
		sessionIo.resizeSession(this.sessions, id, cols, rows);
	}

	retrySession(id: string, replace = false): ServerConflictInfo | null {
		return runRetry(this.sessions, id, replace, {
			clients: this.clients,
			onStatusChange: this.onStatusChange,
			dismiss: this.dismissSession,
			notify: this.notify,
		});
	}

	restart(id: string): RestartResult {
		const result = restartManagedSession(
			this.sessions,
			id,
			this.clients,
			this.onStatusChange,
		);
		if (result.ok) this.notify();
		return result;
	}

	dismissSession = (id: string): void => {
		dismissSessionGated(this.sessions, id, this.notify);
	};

	discardSession = (id: string): void => {
		dismissSessionGated(this.sessions, id, this.notify, true);
	};

	stopSession(id: string): void {
		stopServerSession(this.sessions, id);
	}

	setAutoRun(id: string, enabled: boolean): void {
		if (sessionIo.setAutoRun(this.sessions, id, enabled)) this.notify();
	}

	setAutoAdvance(id: string, enabled: boolean): void {
		if (sessionIo.setAutoAdvance(this.sessions, id, enabled)) this.notify();
	}

	setStarred(id: string, starred: boolean): void {
		if (sessionIo.setStarred(this.sessions, id, starred)) this.notify();
	}

	setTitle(id: string, title: string): void {
		if (setSessionTitle(this.sessions, id, title)) this.notify();
	}

	setStatus(report: HookStatusReport): void {
		setStatusFromHook(this.sessions, report, this.notify, this.onStatusChange);
	}

	/* why: the status line relays token totals keyed by Claude's session id; join
	 * it to the running backlog phase so the spend accumulates against that row. */
	recordUsage(
		claudeSessionId: string,
		transcriptPath: string | undefined,
		usedPct: number | undefined,
	): void {
		applyUsageRecord(
			this.sessions.values(),
			this.clients.currentWindows(),
			this.notify,
			claudeSessionId,
			transcriptPath,
			usedPct,
		);
	}

	listSessions = (): SessionInfo[] => {
		const local = [...this.sessions.values()].map(toSessionInfo);
		return local.concat(this.windowsProxy.sessions());
	};

	private readonly notify = (): void => {
		// During shutdown pty exits must not rewrite sessions.json, or the
		// done statuses would erase the metadata that resume needs on restart
		if (this.shuttingDown) return;
		const windows = this.windowsProxy.sessions();
		broadcastSessions(this.sessions, this.clients, windows, this.active);
		this.onIdleChange?.(this.isIdle());
	};
}
