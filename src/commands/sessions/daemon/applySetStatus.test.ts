import { beforeEach, describe, expect, it, vi } from "vitest";
import { applySetStatus } from "./applySetStatus";
import { makeSession } from "../../../test/mothers/makeSession";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

describe("applySetStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("forwards a status change for a live session", () => {
		const s = makeSession({ status: "waiting" });
		const onStatusChange = vi.fn();

		applySetStatus(
			new Map([[s.id, s]]),
			s.id,
			"running",
			"pretool",
			onStatusChange,
		);

		expect(onStatusChange).toHaveBeenCalledWith(s, "running");
	});

	it("rebinds a live session before applying the hook's status", () => {
		const s = makeSession({ status: "waiting" });
		const rebind = vi.fn();

		applySetStatus(
			new Map([[s.id, s]]),
			s.id,
			"running",
			"prompt",
			vi.fn(),
			rebind,
		);

		expect(rebind).toHaveBeenCalledWith(s);
	});

	it("does not rebind a stopped session", () => {
		const s = makeSession({ status: "stopped" });
		const rebind = vi.fn();

		applySetStatus(
			new Map([[s.id, s]]),
			s.id,
			"running",
			"prompt",
			vi.fn(),
			rebind,
		);

		expect(rebind).not.toHaveBeenCalled();
	});

	it("ignores hooks for a stopped session so a zombie process cannot resurrect it", () => {
		const s = makeSession({
			status: "stopped",
			undurable: { reason: "unpushed commits" },
		});
		const onStatusChange = vi.fn();

		applySetStatus(
			new Map([[s.id, s]]),
			s.id,
			"running",
			"pretool",
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
		expect(s.status).toBe("stopped");
	});

	it.each([
		["a permission prompt", "permission"],
		["an AskUserQuestion picker", "pretool"],
	])("marks %s open until the session runs again", (_, source) => {
		const s = makeSession({ status: "running" });
		const sessions = new Map([[s.id, s]]);

		applySetStatus(sessions, s.id, "waiting", source, vi.fn());
		expect(s.permissionActive).toBe(true);

		applySetStatus(sessions, s.id, "running", "posttool", vi.fn());
		expect(s.permissionActive).toBe(false);
	});

	it("records that the agent resumed over a pending blocking preview", () => {
		const pendingPrPreview = {
			requestId: "check-1",
			title: "t",
			body: "",
			prNumber: null,
			kind: "check" as const,
		};
		const s = makeSession({ status: "running", pendingPrPreview });
		const sessions = new Map([[s.id, s]]);

		applySetStatus(sessions, s.id, "waiting", "stop", vi.fn());
		expect(s.resumedOverPreview).toBeUndefined();

		applySetStatus(sessions, s.id, "running", "posttool", vi.fn());
		expect(s.resumedOverPreview).toBe("check-1");
	});

	it("does not record a resume over a show preview", () => {
		const s = makeSession({
			status: "running",
			pendingPrPreview: {
				requestId: "show-1",
				title: "t",
				body: "",
				prNumber: null,
				kind: "show",
			},
		});

		applySetStatus(new Map([[s.id, s]]), s.id, "running", "pretool", vi.fn());

		expect(s.resumedOverPreview).toBeUndefined();
	});
});
