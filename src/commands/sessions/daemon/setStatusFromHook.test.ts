import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { setStatusFromHook } from "./setStatusFromHook";
import { watchTranscript } from "./watchTranscript";

vi.mock("./watchTranscript", () => ({ watchTranscript: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const watchMock = watchTranscript as unknown as ReturnType<typeof vi.fn>;

describe("setStatusFromHook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rebinds to the post-/clear conversation before applying the status", () => {
		const s = makeSession({
			status: "waiting",
			claudeSessionId: "before-clear",
		});
		const onStatusChange = vi.fn();
		const notify = vi.fn();

		setStatusFromHook(
			new Map([[s.id, s]]),
			{
				id: s.id,
				status: "running",
				source: "prompt",
				claudeSessionId: "after-clear",
			},
			notify,
			onStatusChange,
		);

		expect(s.claudeSessionId).toBe("after-clear");
		expect(watchMock).toHaveBeenCalledWith(s, notify, onStatusChange);
		expect(onStatusChange).toHaveBeenCalledWith(s, "running");
	});

	it("leaves the watcher alone for a hook from the bound conversation", () => {
		const s = makeSession({
			status: "waiting",
			claudeSessionId: "before-clear",
		});

		setStatusFromHook(
			new Map([[s.id, s]]),
			{ id: s.id, status: "running", claudeSessionId: "before-clear" },
			vi.fn(),
			vi.fn(),
		);

		expect(watchMock).not.toHaveBeenCalled();
	});
});
