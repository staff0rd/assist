import { describe, expect, it, vi } from "vitest";
import type { LapEnd } from "../../../watch/decideLap";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";
import { ESCALATION_POLL_MS } from "./holdForEscalation";
import { RETRY_AFTER_FAILURE_MS } from "./backOff";
import { PAUSE_POLL_MS, runAutoUpdateLoop } from "./runAutoUpdateLoop";

function lapsEnding(...ends: (LapEnd | Error)[]): AutoUpdateDeps["runLap"] {
	const queue = [...ends];
	return vi.fn(async (onOutput) => {
		onOutput("pull was not a fast-forward:\nfatal: Not possible\n");
		const next = queue.shift() ?? { code: 0, signal: null };
		if (next instanceof Error) throw next;
		return next;
	});
}

function deps(overrides: Partial<AutoUpdateDeps> = {}): AutoUpdateDeps {
	return {
		runLap: lapsEnding(),
		record: vi.fn(),
		note: vi.fn(),
		enter: vi.fn(),
		liveEscalation: vi.fn(() => undefined),
		escalate: vi.fn(() => "7"),
		isLive: vi.fn(() => false),
		takeHoldRelease: vi.fn(() => false),
		paused: vi.fn(() => false),
		sleep: vi.fn(() => Promise.resolve()),
		...overrides,
	};
}

const exit = (code: number): LapEnd => ({ code, signal: null });

describe("runAutoUpdateLoop", () => {
	it("relaunches straight away after a pull, a timeout or a failed build", async () => {
		const d = deps({ runLap: lapsEnding(exit(0), exit(2), exit(4)) });

		await runAutoUpdateLoop(d, 3);

		expect(d.runLap).toHaveBeenCalledTimes(3);
		expect(d.sleep).not.toHaveBeenCalled();
		expect(d.record).toHaveBeenCalledWith(
			expect.stringContaining("fatal: Not possible"),
		);
	});

	it("escalates a divergence with the lap's output and holds until the session ends", async () => {
		const live = new Set(["7"]);
		const d = deps({
			runLap: lapsEnding(exit(3), exit(0)),
			isLive: vi.fn((id: string) => {
				const was = live.has(id);
				live.delete(id);
				return was;
			}),
		});

		await runAutoUpdateLoop(d, 2);

		expect(d.escalate).toHaveBeenCalledWith(
			expect.stringContaining("fatal: Not possible"),
		);
		expect(d.isLive).toHaveBeenCalledWith("7");
		expect(d.sleep).toHaveBeenCalledWith(ESCALATION_POLL_MS);
		expect(d.runLap).toHaveBeenCalledTimes(2);
		expect(vi.mocked(d.enter).mock.calls).toEqual([
			["waiting"],
			["diverged", { escalationId: "7" }],
			["waiting"],
		]);
	});

	it("backs off with the resolver's reason when the escalation is refused", async () => {
		const d = deps({
			runLap: lapsEnding(exit(3)),
			escalate: vi.fn(() => {
				throw new Error(
					"Divergence escalation is unavailable on Claude:\n  - Claude is not installed",
				);
			}),
		});

		await runAutoUpdateLoop(d, 1);

		expect(d.sleep).toHaveBeenCalledWith(RETRY_AFTER_FAILURE_MS);
		expect(d.enter).toHaveBeenCalledWith("retrying", {
			reason: expect.stringContaining(
				"escalation refused: Divergence escalation is unavailable on Claude:   - Claude is not installed",
			),
		});
	});

	it("holds behind an escalation already live at startup", async () => {
		const isLive = vi.fn().mockReturnValueOnce(true).mockReturnValue(false);
		const d = deps({ liveEscalation: () => "4", isLive });

		await runAutoUpdateLoop(d, 1);

		expect(isLive).toHaveBeenCalledWith("4");
		expect(d.sleep).toHaveBeenCalledWith(ESCALATION_POLL_MS);
		expect(d.note).toHaveBeenCalledWith(
			"paused while session 4 reconciles the divergence",
		);
	});

	it("runs a lap when a check releases the hold while the session stays open", async () => {
		const takeHoldRelease = vi
			.fn()
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true);
		const d = deps({
			liveEscalation: () => "4",
			isLive: vi.fn(() => true),
			takeHoldRelease,
		});

		await runAutoUpdateLoop(d, 1);

		expect(d.sleep).toHaveBeenCalledTimes(2);
		expect(d.runLap).toHaveBeenCalledTimes(1);
		expect(d.note).toHaveBeenCalledWith(
			"check requested while session 4 is open; resuming",
		);
	});

	it("backs off before retrying a lap that cannot wait or start", async () => {
		const d = deps({ runLap: lapsEnding(exit(1), new Error("ENOENT")) });

		await runAutoUpdateLoop(d, 2);

		expect(d.sleep).toHaveBeenCalledTimes(2);
		expect(d.sleep).toHaveBeenCalledWith(RETRY_AFTER_FAILURE_MS);
		expect(d.escalate).not.toHaveBeenCalled();
		expect(d.enter).toHaveBeenCalledWith("retrying", {
			reason: "lap 2 could not start (ENOENT)",
		});
	});

	it("backs off with the lap's last line when the fetch fails, then pulls once it can fetch again", async () => {
		const runLap = vi
			.fn<AutoUpdateDeps["runLap"]>()
			.mockImplementationOnce(async (onOutput) => {
				onOutput("waiting on origin/main …\n");
				onOutput(
					"\u001b[31mgit fetch for origin/main failed: fatal: Authentication failed\u001b[0m\n",
				);
				return exit(5);
			})
			.mockImplementationOnce(async () => exit(0));
		const d = deps({ runLap });

		await runAutoUpdateLoop(d, 2);

		expect(d.enter).toHaveBeenCalledWith("retrying", {
			reason:
				"lap 1 exited 5: git fetch for origin/main failed: fatal: Authentication failed",
		});
		expect(d.sleep).toHaveBeenCalledWith(RETRY_AFTER_FAILURE_MS);
		expect(runLap).toHaveBeenCalledTimes(2);
		expect(d.enter).toHaveBeenLastCalledWith("waiting");
	});

	it("starts no lap until resumed", async () => {
		const paused = vi
			.fn()
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
		const d = deps({ paused });

		await runAutoUpdateLoop(d, 1);

		expect(d.sleep).toHaveBeenCalledTimes(2);
		expect(d.sleep).toHaveBeenCalledWith(PAUSE_POLL_MS);
		expect(d.runLap).toHaveBeenCalledTimes(1);
	});

	it("holds without backing off when a pause stops the lap", async () => {
		const paused = vi
			.fn()
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
		const d = deps({ runLap: lapsEnding(exit(130)), paused });

		await runAutoUpdateLoop(d, 1);

		expect(d.sleep).not.toHaveBeenCalled();
		expect(d.note).toHaveBeenCalledWith("lap 1 exited 130; paused");
	});
});
