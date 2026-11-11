import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { codexConversationReader } from "../../../shared/harnessAdapters/codexConversationReader";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";
import { daemonLog } from "./daemonLog";
import { reportUnrecognisedShapes } from "./reportUnrecognisedShapes";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const logMock = vi.mocked(daemonLog);

describe("reportUnrecognisedShapes", () => {
	beforeEach(() => logMock.mockReset());

	it("logs each unrecognised shape once per session", () => {
		const session = makeSession({ id: "s1", harness: "codex" });
		const entries = [{ type: "snapshot" }, { type: "session_meta" }];
		reportUnrecognisedShapes(session, codexConversationReader, entries);
		reportUnrecognisedShapes(session, codexConversationReader, [
			...entries,
			{ type: "event_msg", payload: { type: "plan_update" } },
		]);
		expect(logMock.mock.calls.map(([line]) => line)).toEqual([
			"transcript s1: unrecognised codex entry shape snapshot (logged once per session)",
			"transcript s1: unrecognised codex entry shape event_msg:plan_update (logged once per session)",
		]);
	});

	it("logs the same shape again for another session", () => {
		const entries = [{ type: "hologram" }];
		reportUnrecognisedShapes(
			makeSession({ id: "a" }),
			claudeConversationReader,
			entries,
		);
		reportUnrecognisedShapes(
			makeSession({ id: "b" }),
			claudeConversationReader,
			entries,
		);
		expect(logMock).toHaveBeenCalledTimes(2);
		expect(logMock.mock.calls[1][0]).toBe(
			"transcript b: unrecognised claude entry shape hologram (logged once per session)",
		);
	});

	it("stays silent for recognised entries and readers without the hook", () => {
		const session = makeSession({ id: "s2" });
		reportUnrecognisedShapes(session, claudeConversationReader, [
			{ type: "user", message: { content: "hi" } },
			{ type: "file-history-snapshot" },
		]);
		const { unrecognised: _unrecognised, ...silent } = claudeConversationReader;
		reportUnrecognisedShapes(session, silent, [{ type: "hologram" }]);
		expect(logMock).not.toHaveBeenCalled();
	});
});
