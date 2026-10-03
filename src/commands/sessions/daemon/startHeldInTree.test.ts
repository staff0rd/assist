import { describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionClient } from "./broadcast";
import { startHeldInTree } from "./startHeldInTree";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

const pendingStart = () => makePty().pty;

function run(sessions: Session[], seeded: Session) {
	startHeldInTree(
		seeded,
		new Map(sessions.map((s) => [s.id, s])),
		new Set<SessionClient>(),
		vi.fn(),
		vi.fn(),
	);
}

describe("startHeldInTree", () => {
	it("starts an agent added to a stream whose workspace was still seeding", () => {
		const seeded = makeSession({
			id: "4",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart,
		});
		const joined = makeSession({
			id: "5",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart,
		});

		run([seeded, joined], seeded);

		expect(seeded.pty).not.toBeNull();
		expect(joined.pty).not.toBeNull();
		expect(joined.pendingStart).toBeUndefined();
	});

	it("leaves a session held in another workspace alone", () => {
		const seeded = makeSession({
			id: "4",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart,
		});
		const elsewhere = makeSession({
			id: "6",
			cwd: "/git/repo-3",
			pty: null,
			pendingStart,
		});

		run([seeded, elsewhere], seeded);

		expect(seeded.pty).not.toBeNull();
		expect(elsewhere.pty).toBeNull();
		expect(elsewhere.pendingStart).toBeDefined();
	});
});
