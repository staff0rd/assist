import { apiFetch } from "../../../../apiFetch";
import { postJson } from "../../../postJson";
import type { InboxMessage, InboxStatus } from "./types";

let current: InboxMessage[] | undefined;
let status: InboxStatus | undefined;
const listeners = new Set<() => void>();

function emit(): void {
	for (const listener of listeners) listener();
}

function set(messages: InboxMessage[]): void {
	current = messages;
	emit();
}

function setStatus(next: InboxStatus): void {
	status = next;
	emit();
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

async function refreshStatus(): Promise<void> {
	try {
		const res = await apiFetch("/api/inbox/status");
		if (res.ok) setStatus(await res.json());
	} catch {}
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

async function scan(): Promise<void> {
	if (status) setStatus({ ...status, scanning: true, lastError: null });
	try {
		await postJson("/api/inbox/scan", {}, "Failed to start inbox scan");
	} finally {
		await refreshStatus();
	}
}

export const inboxStore = {
	get: (): InboxMessage[] | undefined => current,
	getStatus: (): InboxStatus | undefined => status,
	refresh,
	refreshStatus,
	dismiss,
	scan,
	subscribe(listener: () => void): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
};
