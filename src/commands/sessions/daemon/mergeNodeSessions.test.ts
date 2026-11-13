import { expect, it } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionInfo } from "./createSession";
import { mergeNodeSessions } from "./mergeNodeSessions";

function info(id: string, startedAt: number, node?: string): SessionInfo {
	return { ...makeSession({ id, startedAt }), node } as SessionInfo;
}

const ids = (sessions: SessionInfo[]) => sessions.map((s) => s.id);

it("places a new local session after older linked sessions", () => {
	const local = [info("l1", 1), info("l2", 5)];
	const linked = [info("m1", 2, "mac"), info("m2", 3, "mac")];
	expect(ids(mergeNodeSessions(local, linked))).toEqual([
		"l1",
		"m1",
		"m2",
		"l2",
	]);
});

it("places a new linked session after older local sessions", () => {
	const local = [info("l1", 1), info("l2", 3)];
	const linked = [info("m1", 2, "mac"), info("m2", 4, "mac")];
	expect(ids(mergeNodeSessions(local, linked))).toEqual([
		"l1",
		"m1",
		"l2",
		"m2",
	]);
});

it("keeps each node's own order even when start times disagree", () => {
	const local = [info("l1", 9), info("l2", 1)];
	const linked = [info("m1", 5, "mac"), info("u1", 2, "ubuntu")];
	expect(ids(mergeNodeSessions(local, linked))).toEqual([
		"u1",
		"m1",
		"l1",
		"l2",
	]);
});
