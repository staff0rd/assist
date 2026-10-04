import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../types";
import { resumeWatcherAfterEscalation } from "./resumeWatcherAfterEscalation";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

const escalation = makeSession({
	id: "9",
	status: "done",
	cwd: "/git/repo",
	divergenceEscalation: true,
});

const watcher = (status: Session["status"], cwd = "/git/repo") =>
	makeSession({ id: "1", watcher: true, commandType: "assist", status, cwd });

const sessionsOf = (...list: Session[]) => new Map(list.map((s) => [s.id, s]));

describe("resumeWatcherAfterEscalation", () => {
	const restart = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each<Session["status"]>(["error", "done"])(
		"restarts a %s watcher in the escalation's clone",
		(status) => {
			resumeWatcherAfterEscalation(
				sessionsOf(watcher(status), escalation),
				escalation,
				restart,
			);

			expect(restart).toHaveBeenCalledWith("1");
		},
	);

	it("leaves a watcher that is already running alone", () => {
		resumeWatcherAfterEscalation(
			sessionsOf(watcher("running"), escalation),
			escalation,
			restart,
		);

		expect(restart).not.toHaveBeenCalled();
	});

	it("ignores a watcher in another clone", () => {
		resumeWatcherAfterEscalation(
			sessionsOf(watcher("error", "/git/other"), escalation),
			escalation,
			restart,
		);

		expect(restart).not.toHaveBeenCalled();
	});

	it("does nothing for a session that is not an escalation", () => {
		const plain = makeSession({ id: "4", status: "done", cwd: "/git/repo" });

		resumeWatcherAfterEscalation(
			sessionsOf(watcher("error"), plain),
			plain,
			restart,
		);

		expect(restart).not.toHaveBeenCalled();
	});
});
