// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardPrActions } from "./CardPrActions";
import type { SessionInfo } from "../../types";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "5",
		name: "assist review-pr-comments 12",
		commandType: "assist",
		assistArgs: ["review-pr-comments", "12"],
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		cwd: "/git/repo",
		...overrides,
	};
}

function stubFetch({ pr, synthesis }: { pr: boolean; synthesis: boolean }) {
	vi.stubGlobal(
		"fetch",
		vi.fn(async (url: string) => {
			if (url.startsWith("/api/review/synthesis"))
				return synthesis
					? { ok: true, status: 200, json: async () => ({ synthesis: "## f" }) }
					: { ok: false, status: 404, json: async () => ({}) };
			return {
				ok: true,
				status: 200,
				json: async () => ({
					pr: pr
						? {
								number: 12,
								title: "Add a thing",
								author: "someone",
								createdAt: new Date(0).toISOString(),
								url: "https://github.com/org/repo/pull/12",
							}
						: null,
				}),
			};
		}),
	);
}

function renderActions(s: SessionInfo = session()) {
	render(<CardPrActions session={s} />);
}

const reviewButton = () => screen.findByRole("button", { name: "Review PR" });
const findingsButton = () =>
	screen.findByRole("button", { name: "View review findings" });

describe("CardPrActions review pairing", () => {
	it("leaves the PR actions as siblings so the bar can wrap them", async () => {
		stubFetch({ pr: true, synthesis: true });
		renderActions();

		const open = await screen.findByRole("button", { name: "Open PR" });
		const review = await reviewButton();
		const findings = await findingsButton();

		expect(review.parentElement).toBe(open.parentElement);
		expect(findings.parentElement).toBe(open.parentElement);
	});

	it("leaves the review button alone when there are no findings", async () => {
		stubFetch({ pr: true, synthesis: false });
		renderActions();

		await reviewButton();

		await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
		expect(
			screen.queryByRole("button", { name: "View review findings" }),
		).toBeNull();
	});

	it("gives a fix-conflict session the same PR-scoped actions", async () => {
		stubFetch({ pr: true, synthesis: true });
		renderActions(
			session({
				name: "assist fix-conflict 12",
				assistArgs: ["fix-conflict", "12"],
				subtitle: "#12 · someone · 2h ago",
			}),
		);

		expect(await screen.findByRole("button", { name: "Open PR" })).toBeTruthy();
		expect(await reviewButton()).toBeTruthy();
		expect(await findingsButton()).toBeTruthy();
	});

	it("still shows the findings button when the session has no PR", async () => {
		stubFetch({ pr: false, synthesis: true });
		renderActions();

		expect(await findingsButton()).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Review PR" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Open PR" })).toBeNull();
	});
});
