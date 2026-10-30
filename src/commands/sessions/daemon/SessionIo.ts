import type { SessionClient } from "./broadcast";
import type { ViewerClaim } from "./claimViewer";
import { findDocsSession } from "./findDocsSession";
import type { WriteTarget } from "./lastWriteTimes";
import type { NodeLinks } from "./links/NodeLinks";
import { releaseViewer } from "./releaseViewer";
import type { OnStatusChange, Session } from "./types";
import { type ResizeViewer, resizeSession } from "./resizeSession";
import { flushPendingPrompts } from "./flushPendingPrompts";
import { typePromptIntoSession } from "./typePromptIntoSession";
import { type TypePromptReply, typePromptReply } from "./typePromptReply";
import { ViewerConnections } from "./ViewerConnections";
import { writeToSession } from "./writeToSession";

export class SessionIo {
	private readonly viewers = new ViewerConnections();

	constructor(
		private readonly sessions: Map<string, Session>,
		private readonly onStatusChange: () => OnStatusChange,
		private readonly notify: () => void,
		private readonly links: NodeLinks,
	) {}

	trackViewer(client: SessionClient, d: Record<string, unknown>): void {
		if (typeof d.viewerId !== "string") return;
		this.viewers.track(client, d.viewerId);
		d.viewerNode ??= this.links.localNode();
	}

	viewerLeft(client: SessionClient, viewerId?: string): void {
		let released = false;
		for (const id of this.viewers.releaseUnheld(client, viewerId)) {
			released = releaseViewer(this.sessions, id) || released;
			this.links.viewerLeft(client, id);
		}
		if (released) this.notify();
	}

	write(id: string, data: string, viewer: ViewerClaim): void {
		writeToSession(this.sessions, id, data, this.onStatusChange(), {
			...viewer,
			onClaim: this.notify,
		});
	}

	typePrompt(id: string, text: string): TypePromptReply {
		const result = typePromptIntoSession(
			this.sessions,
			id,
			text,
			this.writeAsDaemon,
		);
		if ("queued" in result && result.queued) this.notify();
		return typePromptReply(id, result);
	}

	async typePromptToLastWriter(
		target: WriteTarget,
		text: string,
	): Promise<TypePromptReply> {
		const id = await findDocsSession(this.sessions, target);
		if (!id)
			return {
				ok: false,
				message: `No live Claude session shares a directory with the server for ${target.file} or has written anything in ${target.within}`,
			};
		return this.typePrompt(id, text);
	}

	flushPendingPrompts(id: string): void {
		if (flushPendingPrompts(this.sessions.get(id), this.writeAsDaemon))
			this.notify();
	}

	private readonly writeAsDaemon = (id: string, data: string) =>
		this.write(id, data, {});

	resize(id: string, cols: number, rows: number, viewer?: ResizeViewer): void {
		const s = this.sessions.get(id);
		const before = `${s?.cols}x${s?.rows}`;
		resizeSession(this.sessions, id, cols, rows, {
			...viewer,
			onClaim: this.notify,
		});
		if (s && `${s.cols}x${s.rows}` !== before) this.notify();
	}
}
