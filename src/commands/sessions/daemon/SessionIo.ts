import type { SessionClient } from "./broadcast";
import type { ViewerClaim } from "./claimViewer";
import type { NodeLinks } from "./links/NodeLinks";
import { releaseViewer } from "./releaseViewer";
import type { OnStatusChange, Session } from "./types";
import { resizeSession } from "./resizeSession";
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

	resize(id: string, cols: number, rows: number, viewer?: ViewerClaim): void {
		resizeSession(this.sessions, id, cols, rows, {
			...viewer,
			onClaim: this.notify,
		});
	}
}
