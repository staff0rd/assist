import type { SessionClient } from "./broadcast";

export class ViewerConnections {
	private readonly byClient = new Map<SessionClient, Set<string>>();

	track(client: SessionClient, viewerId: string): void {
		const ids = this.byClient.get(client) ?? new Set<string>();
		ids.add(viewerId);
		this.byClient.set(client, ids);
	}

	releaseUnheld(client: SessionClient, viewerId?: string): string[] {
		const ids = this.byClient.get(client);
		if (!ids) return [];
		const dropped = viewerId === undefined ? [...ids] : [viewerId];
		for (const id of dropped) ids.delete(id);
		if (ids.size === 0) this.byClient.delete(client);
		return dropped.filter((id) => !this.isHeld(id));
	}

	private isHeld(viewerId: string): boolean {
		for (const ids of this.byClient.values())
			if (ids.has(viewerId)) return true;
		return false;
	}
}
