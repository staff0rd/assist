import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessAdapterModule from "../../shared/harnessAdapters/harnessAdapter";
import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../shared/harnesses";
import { fakeHarnessMock } from "../../test/mocks/fakeHarnessMock";
import { buildReviewPaths } from "./buildReviewPaths";
import { planReviewers } from "./planReviewers";
import type { ReviewerSlot } from "./reviewerSlots";
import { reviewerSlots } from "./reviewerSlots";
import { runReviewers } from "./runReviewers";
import { runStreamingChild } from "./runStreamingChild";
import { runSynthesisReviewer } from "./runSynthesisReviewer";
import { fakeHarnessCalls } from "../../test/mocks/fakeHarnessCalls";

const state = vi.hoisted(() => ({
	missing: new Set<string>(),
	install: false,
	fake: undefined as HarnessAdapter | undefined,
}));

vi.mock("./runStreamingChild", () => ({ runStreamingChild: vi.fn() }));
vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => ({ harness: { engine: "claude" }, review: {} }),
}));
vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: () => Promise.resolve(state.install),
}));
vi.mock("../../shared/harnessAdapters/detectHarness", () => ({
	detectHarness: (kind: string) =>
		state.missing.has(kind)
			? {
					supported: false,
					reason: `${kind} is not installed`,
					remediation: `install ${kind}`,
				}
			: { supported: true },
}));
vi.mock(
	"../../shared/harnessAdapters/harnessAdapter",
	async (importOriginal) => {
		const actual = await importOriginal<typeof harnessAdapterModule>();
		return {
			harnessAdapter: (kind: HarnessKind | undefined) =>
				(kind as string) === "fake" && state.fake
					? state.fake
					: actual.harnessAdapter(kind),
		};
	},
);

const spawned = () =>
	vi.mocked(runStreamingChild).mock.calls.map(([spec]) => spec.command);

function freshPaths() {
	return buildReviewPaths("/nonexistent/repo", `pr-${Math.random()}`);
}

async function runAll(slots: ReviewerSlot[]) {
	const reviewers = await planReviewers(slots);
	return runReviewers(reviewers, {
		reviewDir: "/review",
		stdin: "review this",
		multi: undefined,
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
	state.missing.clear();
	state.install = false;
	vi.mocked(runStreamingChild).mockResolvedValue({
		exitCode: 0,
		stderr: "",
		stdout: "",
		elapsedMs: 1,
	});
});

describe("reviewer combinations", () => {
	it("runs the Claude and Codex reviewers when both are installed", async () => {
		const { results, fresh } = await runAll(reviewerSlots(freshPaths()));

		expect(spawned().sort()).toEqual(["claude", "codex"]);
		expect(results.map((r) => r.name)).toEqual(["claude", "codex"]);
		expect(fresh).toHaveLength(2);
	});

	it("runs the Codex review path without the Claude executable", async () => {
		state.missing.add("claude");

		const { results, fresh } = await runAll(reviewerSlots(freshPaths()));

		expect(spawned()).toEqual(["codex"]);
		expect(results[0]).toMatchObject({ name: "claude", skipped: true });
		expect(fresh.map((r) => r.name)).toEqual(["codex"]);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining("The claude reviewer is unavailable on Claude"),
		);
	});

	it("skips Codex when it is missing and the install is declined", async () => {
		state.missing.add("codex");

		const { results } = await runAll(reviewerSlots(freshPaths()));

		expect(spawned()).toEqual(["claude"]);
		expect(results[1]).toMatchObject({ name: "codex", skipped: true });
	});

	it("runs a fake reviewer through its adapter alone", async () => {
		const calls = fakeHarnessCalls();
		state.fake = fakeHarnessMock(calls);
		const outputPath = join(
			mkdtempSync(join(tmpdir(), "review-fake-")),
			"fake.md",
		);

		const { results } = await runAll([
			{ name: "fake", harness: "fake" as never, outputPath },
		]);

		expect(spawned()).toEqual([]);
		expect(calls.structured).toEqual([
			expect.objectContaining({
				name: "fake",
				stdin: "review this",
				outputPath,
				readDir: "/review",
			}),
		]);
		expect(results[0]).toMatchObject({ name: "fake", exitCode: 0 });
	});
});

describe("synthesis harness", () => {
	const spec = {
		reviewDir: "/review",
		stdin: "synthesise",
		outputPath: "/review/synthesis.md",
		multi: undefined,
	};

	it("synthesises with Codex without the Claude executable", async () => {
		state.missing.add("claude");

		const result = await runSynthesisReviewer({ ...spec, harness: "codex" });

		expect(spawned()).toEqual(["codex"]);
		expect(result).toMatchObject({ name: "synthesis", exitCode: 0 });
	});

	it("fails with the reasons instead of falling back when Codex is missing", async () => {
		state.missing.add("codex");

		const result = await runSynthesisReviewer({ ...spec, harness: "codex" });

		expect(spawned()).toEqual([]);
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("Review synthesis is unavailable on Codex");
	});

	it("refuses pi, which cannot run a structured review", async () => {
		const result = await runSynthesisReviewer({ ...spec, harness: "pi" });

		expect(spawned()).toEqual([]);
		expect(result.stderr).toContain("oneShot.structured");
	});
});
