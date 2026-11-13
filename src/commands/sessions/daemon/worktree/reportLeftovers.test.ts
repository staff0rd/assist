import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { makeSessionSpawner } from "../makeSessionSpawner";
import { reportLeftovers } from "./reportLeftovers";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../maxLiveSessions", () => ({ maxLiveSessions: () => 1 }));
vi.mock("../registerSpawnedSession", () => ({
	registerSpawnedSession: (
		session: Session,
		sessions: Map<string, Session>,
	) => {
		sessions.set(session.id, session);
		return session.id;
	},
}));

let root: string;

function leftovers(count: number) {
	return Array.from({ length: count }, (_, i) => {
		const path = join(root, `repo-${i + 2}`);
		mkdirSync(join(path, "docker-local"), { recursive: true });
		return { path, reason: `EACCES ${i}` };
	});
}

function setup() {
	const sessions = new Map<string, Session>();
	const spawner = makeSessionSpawner(
		sessions,
		new Set(),
		{ next: 1 },
		() => vi.fn(),
		() => {},
	);
	return { sessions, spawner };
}

describe("reportLeftovers", () => {
	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "leftovers-"));
	});

	it("lists 16+ leftovers in one notice that takes no live-session slot", () => {
		const { sessions, spawner } = setup();
		const listed = leftovers(17);

		reportLeftovers(sessions, spawner.recoveryCard, listed, () => {});

		expect(sessions.size).toBe(1);
		const notice = [...sessions.values()][0];
		expect(notice?.leftoverNotice).toBe(true);
		expect(notice?.error).toContain(
			`rm -rf ${listed.map((l) => l.path).join(" ")}`,
		);
		for (const l of listed) expect(notice?.scrollback).toContain(l.reason);
		expect(() =>
			spawner.spawn(
				(id) => ({ ...notice, id, leftoverNotice: undefined }) as Session,
			),
		).not.toThrow();
	});

	it("updates the existing notice in place on a second report", () => {
		const { sessions, spawner } = setup();
		reportLeftovers(sessions, spawner.recoveryCard, leftovers(3), () => {});
		const [id] = [...sessions.keys()];

		reportLeftovers(sessions, spawner.recoveryCard, leftovers(2), () => {});

		expect([...sessions.keys()]).toEqual([id]);
		expect(sessions.get(id ?? "")?.error).toContain("2 leftover workspaces");
	});

	it("drops the notice once every listed path is gone", () => {
		const { sessions, spawner } = setup();
		reportLeftovers(sessions, spawner.recoveryCard, leftovers(2), () => {});

		reportLeftovers(sessions, spawner.recoveryCard, [], () => {});

		expect(sessions.size).toBe(0);
	});

	it("quotes paths that need it in the removal command", () => {
		const { sessions, spawner } = setup();
		const path = join(root, "it's here");
		mkdirSync(path);

		reportLeftovers(
			sessions,
			spawner.recoveryCard,
			[{ path, reason: "x" }],
			() => {},
		);

		expect([...sessions.values()][0]?.error).toContain(
			`rm -rf '${path.replace("'", `'\\''`)}'`,
		);
	});
});
