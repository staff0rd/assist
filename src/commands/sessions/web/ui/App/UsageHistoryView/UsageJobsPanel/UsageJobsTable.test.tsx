// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { UsageJobRow } from "../fetchUsageJobs";
import { UsageJobsTable } from "./UsageJobsTable";

afterEach(cleanup);

const finished: UsageJobRow = {
	id: 2,
	kind: "inbox-scan",
	trigger: "scheduled",
	model: "claude-sonnet-x",
	startedAt: new Date(Date.now() - 3_600_000).toISOString(),
	finishedAt: new Date(Date.now() - 3_450_000).toISOString(),
	durationMs: 150_000,
	inputTokens: 132_000,
	outputTokens: 3_400,
	cacheReadTokens: 118_000,
	cacheWriteTokens: 11_000,
	costUsd: 0.214,
	status: "finished",
	detail: "3 flagged · 1 new",
	repo: null,
	prNumber: null,
	reviewer: null,
};

const running: UsageJobRow = {
	...finished,
	id: 3,
	trigger: "manual",
	model: null,
	startedAt: new Date().toISOString(),
	finishedAt: null,
	durationMs: null,
	inputTokens: 0,
	outputTokens: 0,
	cacheReadTokens: 0,
	cacheWriteTokens: 0,
	costUsd: null,
	status: "running",
	detail: null,
};

describe("UsageJobsTable", () => {
	it("renders a finished inbox scan's figures", () => {
		render(<UsageJobsTable rows={[finished]} />);
		expect(screen.getByText("Inbox scan")).toBeTruthy();
		expect(screen.getByText("3 flagged · 1 new")).toBeTruthy();
		expect(screen.getByText("Scheduled")).toBeTruthy();
		expect(screen.getByText("claude-sonnet-x")).toBeTruthy();
		expect(screen.getByText("1h ago")).toBeTruthy();
		expect(screen.getByText("2m 30s")).toBeTruthy();
		expect(screen.getByText("↑ 132.0k ↓ 3.4k")).toBeTruthy();
		expect(screen.getByText("118.0k / 11.0k")).toBeTruthy();
		expect(screen.getByText("$0.21")).toBeTruthy();
		expect(screen.getByText("Finished")).toBeTruthy();
	});

	it("renders a review row's PR, repo and reviewer with no cost", () => {
		render(
			<UsageJobsTable
				rows={[
					{
						...finished,
						kind: "review",
						trigger: "manual",
						costUsd: null,
						detail: null,
						repo: "assist",
						prNumber: 412,
						reviewer: "codex",
					},
				]}
			/>,
		);
		expect(screen.getByText("PR review")).toBeTruthy();
		expect(screen.getByText("#412 · assist · codex")).toBeTruthy();
		expect(screen.getByText("—")).toBeTruthy();
	});

	it("shows dashes for a running scan's missing figures", () => {
		render(<UsageJobsTable rows={[running]} />);
		expect(screen.getByText("Manual")).toBeTruthy();
		expect(screen.getByText("Running")).toBeTruthy();
		expect(screen.getAllByText("—")).toHaveLength(3);
	});
});
