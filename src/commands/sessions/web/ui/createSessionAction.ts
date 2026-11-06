import type { ResizeMode } from "./ResizeFn";
import type { DismissOptions } from "./types";
import { sendCreate } from "./createHarnessSessionAction";
import { viewerId } from "./viewerId";

type SendFn = (msg: object) => void;

export function createSessionAction(send: SendFn) {
	return (prompt: string, cwd?: string, node?: string, open?: boolean) =>
		sendCreate(send, { auto: true }, prompt, cwd, node, open);
}

export type AssistLaunchMeta = {
	title?: string;
	subtitle?: string;
	inPlace?: boolean;
	launchedFrom?: string;
	node?: string;
	autoApprove?: boolean;
	open?: boolean;
};

export function resumeSessionAction(send: SendFn) {
	return (
		sessionId: string,
		cwd: string,
		name?: string,
		harness?: string,
		node?: string,
	) => send({ type: "resume", sessionId, cwd, name, harness, node });
}

export function retrySessionAction(send: SendFn, buffers: Map<string, string>) {
	return (id: string, replace?: boolean) => {
		// Keep the output handler registered: the terminal pane stays mounted
		// across a retry, and the daemon's clear broadcast resets it
		buffers.delete(id);
		send({ type: "retry", sessionId: id, replace });
	};
}

export function restartSessionAction(
	send: SendFn,
	buffers: Map<string, string>,
) {
	return (id: string) => {
		buffers.delete(id);
		send({ type: "restart", sessionId: id });
	};
}

export function dismissSessionAction(
	send: SendFn,
	buffers: Map<string, string>,
) {
	return (id: string, opts?: DismissOptions) => {
		send({ type: "dismiss", sessionId: id, ...opts });
		buffers.delete(id);
	};
}

export function discardSessionAction(
	send: SendFn,
	buffers: Map<string, string>,
) {
	return (id: string) => {
		send({ type: "discard", sessionId: id });
		buffers.delete(id);
	};
}

export function stopSessionAction(send: SendFn) {
	return (id: string) => send({ type: "stop", sessionId: id });
}

export type TransferSessionFn = (
	id: string,
	target: string,
	cwd: string,
) => void;

export function transferSessionAction(send: SendFn): TransferSessionFn {
	return (id, target, cwd) =>
		send({ type: "transfer", sessionId: id, target, cwd });
}

export function cancelTransferAction(send: SendFn) {
	return (id: string) => send({ type: "cancel-transfer", sessionId: id });
}

export function createRunAction(send: SendFn) {
	return (
		runName: string,
		cwd?: string,
		replace?: boolean,
		launchedFrom?: string,
		node?: string,
	) => send({ type: "create-run", runName, cwd, replace, launchedFrom, node });
}

export function setAutoApproveAction(send: SendFn) {
	return (id: string, enabled: boolean) =>
		send({ type: "set-autoapprove", sessionId: id, enabled });
}

export function setAutoAdvanceAction(send: SendFn) {
	return (id: string, enabled: boolean) =>
		send({ type: "set-autoadvance", sessionId: id, enabled });
}

export function setStarredAction(send: SendFn) {
	return (id: string, starred: boolean) =>
		send({ type: "set-starred", sessionId: id, starred });
}

export function inputAction(send: SendFn) {
	return (sessionId: string, data: string) =>
		send({ type: "input", sessionId, data, viewerId });
}

export function resizeAction(send: SendFn) {
	return (sessionId: string, cols: number, rows: number, mode?: ResizeMode) =>
		send({
			type: "resize",
			sessionId,
			cols,
			rows,
			viewerId,
			claim: mode === "claim",
			refresh: mode === "refresh",
		});
}
