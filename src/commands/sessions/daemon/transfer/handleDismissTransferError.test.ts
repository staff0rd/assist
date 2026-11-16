import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import type { SessionManager } from "../SessionManager";
import { handleDismissTransferError } from "./handleTransfer";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

function setup(transfer: Session["transfer"]) {
	const session = makeSession({ id: "7", transfer });
	const sessions = new Map<string, Session>([["7", session]]);
	const notify = vi.fn();
	const manager = {
		links: { route: () => false },
		session: (id: string) => sessions.get(id),
		update: (mutate: (s: Map<string, Session>) => boolean) => {
			if (mutate(sessions)) notify();
		},
	} as unknown as SessionManager;
	const client: SessionClient = { send: vi.fn() };
	const dismiss = () =>
		handleDismissTransferError(client, manager, { sessionId: "7" });
	return { session, notify, dismiss };
}

describe("handleDismissTransferError", () => {
	it("clears a failed transfer and notifies clients", () => {
		const { session, notify, dismiss } = setup({
			target: "mac",
			error: "remote rejected",
		});
		dismiss();
		expect(session.transfer).toBeUndefined();
		expect(notify).toHaveBeenCalledOnce();
	});

	it("leaves an in-flight transfer alone", () => {
		const { session, notify, dismiss } = setup({ target: "mac" });
		dismiss();
		expect(session.transfer).toEqual({ target: "mac" });
		expect(notify).not.toHaveBeenCalled();
	});

	it("leaves a queued transfer alone", () => {
		const { session, notify, dismiss } = setup({
			target: "mac",
			queued: { cwd: "/x" },
		});
		dismiss();
		expect(session.transfer?.queued).toEqual({ cwd: "/x" });
		expect(notify).not.toHaveBeenCalled();
	});
});
