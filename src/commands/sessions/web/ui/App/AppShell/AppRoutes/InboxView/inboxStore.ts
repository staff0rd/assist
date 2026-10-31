import { apiFetch } from "../../../../apiFetch";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";
import { postJson } from "../../../postJson";
import type { InboxMessage, InboxStatus } from "./types";

let current: InboxMessage[] | undefined;
let status: InboxStatus | undefined;
let statusError: string | undefined;
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
	} catch (error) {
		reportCaughtError(error, "inbox refresh");
		if (current === undefined) set([]);
	}
}

async function refreshStatus(): Promise<void> {
	try {
		const res = await apiFetch("/api/inbox/status");
		const body = await res.json().catch(() => ({}));
		if (res.ok) {
			statusError = undefined;
			setStatus(body);
			return;
		}
		statusError = `Couldn't read scan status: ${body.error ?? `HTTP ${res.status}`}`;
	} catch (error) {
		statusError = `Couldn't read scan status: ${String(error)}`;
	}
	emit();
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
	} catch (error) {
		statusError = error instanceof Error ? error.message : String(error);
		if (status) status = { ...status, scanning: false };
		emit();
		return;
	}
	await refreshStatus();
}

export const inboxStore = {
	get: (): InboxMessage[] | undefined => current,
	getStatus: (): InboxStatus | undefined => status,
	getStatusError: (): string | undefined => statusError,
	refresh,
	refreshStatus,
	dismiss,
	scan,
	subscribe(listener: () => void): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
};
