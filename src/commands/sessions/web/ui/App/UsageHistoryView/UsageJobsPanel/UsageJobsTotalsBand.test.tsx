// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { UsageJobTotals } from "../fetchUsageJobs";
import { UsageJobsTotalsBand } from "./UsageJobsTotalsBand";

afterEach(cleanup);

const totals: UsageJobTotals = {
	runs: 142,
	runsByKind: { "inbox-scan": 118, review: 24 },
	inputTokens: 18_400_000,
	outputTokens: 612_000,
	cacheReadTokens: 15_900_000,
	costUsd: 41.857,
	failed: 3,
	lastFailure: {
		kind: "inbox-scan",
		startedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
	},
};

describe("UsageJobsTotalsBand", () => {
	it("shows runs by kind, tokens, cost and the last failure", () => {
		render(<UsageJobsTotalsBand totals={totals} />);
		expect(screen.getByText("142")).toBeTruthy();
		expect(screen.getByText("118 inbox · 24 review")).toBeTruthy();
		expect(screen.getByText("↑ 18.4M ↓ 612.0k")).toBeTruthy();
		expect(screen.getByText("+ 15.9M cache read")).toBeTruthy();
		expect(screen.getByText("$41.86")).toBeTruthy();
		expect(screen.getByText("last: inbox scan, 2d ago")).toBeTruthy();
	});

	it("shows no cost or failure when none is recorded", () => {
		render(
			<UsageJobsTotalsBand
				totals={{ ...totals, costUsd: null, failed: 0, lastFailure: null }}
			/>,
		);
		expect(screen.getByText("—")).toBeTruthy();
		expect(screen.getByText("none in 30 days")).toBeTruthy();
	});
});
