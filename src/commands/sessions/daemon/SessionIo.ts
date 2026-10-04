import type { ViewerClaim } from "./claimViewer";
import type { OnStatusChange, Session } from "./types";
import { resizeSession } from "./resizeSession";
import { writeToSession } from "./writeToSession";

export class SessionIo {
	constructor(
		private readonly sessions: Map<string, Session>,
		private readonly onStatusChange: () => OnStatusChange,
		private readonly notify: () => void,
	) {}

	write(id: string, data: string, viewerId?: string): void {
		writeToSession(this.sessions, id, data, this.onStatusChange(), {
			viewerId,
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
