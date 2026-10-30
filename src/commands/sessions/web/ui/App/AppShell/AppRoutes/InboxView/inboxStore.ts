import { apiFetch } from "../../../../apiFetch";
import { postJson } from "../../../postJson";
import type { InboxMessage } from "./types";

let current: InboxMessage[] | undefined;
const listeners = new Set<() => void>();

function set(messages: InboxMessage[]): void {
	current = messages;
	for (const listener of listeners) listener();
}

async function refresh(): Promise<void> {
	try {
		const res = await apiFetch("/api/inbox");
		const body = await res.json();
		if (res.ok && Array.isArray(body)) set(body);
	} catch {
		if (current === undefined) set([]);
	}
}

async function dismiss(id: string): Promise<void> {
	set((current ?? []).filter((m) => m.id !== id));
	try {
		await postJson(
			`/api/inbox/${encodeURIComponent(id)}/dismiss`,
			{},
			"Failed to dismiss message",
		);
	} finally {
		await refresh();
	}
}

export const inboxStore = {
	get: (): InboxMessage[] | undefined => current,
	refresh,
	dismiss,
	subscribe(listener: () => void): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
};
