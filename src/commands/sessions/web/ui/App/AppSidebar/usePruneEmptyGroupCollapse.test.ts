// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { groupCollapseStore } from "./useCollapsedGroups/groupCollapseStore";
import { usePruneEmptyGroupCollapse } from "./usePruneEmptyGroupCollapse";
import type { SessionInfo } from "../../types";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";

afterEach(() => {
	localStorage.clear();
});

const kept = { origin: "host/org/kept", clone: "/git/kept" };
const emptied = { origin: "host/org/emptied", clone: "/git/emptied" };

function savedKeys(): string[] {
	return Object.keys(groupCollapseStore.parse(groupCollapseStore.getRaw()));
}

function seedCollapsed(): void {
	groupCollapseStore.setChoice(kept.origin, { collapsedAt: 1 });
	groupCollapseStore.setChoice(emptied.origin, { collapsedAt: 1 });
}

describe("usePruneEmptyGroupCollapse", () => {
	it("forgets a group with no live sessions and keeps one that still has sessions", () => {
		seedCollapsed();

		renderHook(() =>
			usePruneEmptyGroupCollapse(
				[makeSessionInfo({ id: "a", cwd: "/git/kept-2", repoGroup: kept })],
				true,
			),
		);

		expect(savedKeys()).toEqual([kept.origin]);
	});

	it("prunes nothing before the first session list arrives", () => {
		seedCollapsed();

		renderHook(() => usePruneEmptyGroupCollapse([], false));

		expect(savedKeys()).toEqual([kept.origin, emptied.origin]);
	});

	it("forgets a group once its last session leaves the live list", () => {
		seedCollapsed();
		const member = makeSessionInfo({
			id: "e",
			cwd: "/git/emptied-2",
			repoGroup: emptied,
		});
		const { rerender } = renderHook(
			({ sessions }: { sessions: SessionInfo[] }) =>
				usePruneEmptyGroupCollapse(sessions, true),
			{ initialProps: { sessions: [member] } },
		);
		expect(savedKeys()).toEqual([emptied.origin]);

		rerender({ sessions: [] });

		expect(savedKeys()).toEqual([]);
	});
});

describe("groupCollapseStore.removeChoices", () => {
	it("removes only the named keys and notifies subscribers", () => {
		seedCollapsed();
		let notified = 0;
		const unsubscribe = groupCollapseStore.subscribe(() => notified++);

		groupCollapseStore.removeChoices([emptied.origin]);
		unsubscribe();

		expect(savedKeys()).toEqual([kept.origin]);
		expect(notified).toBe(1);
	});

	it("skips the write when no named key is saved", () => {
		seedCollapsed();
		let notified = 0;
		const unsubscribe = groupCollapseStore.subscribe(() => notified++);

		groupCollapseStore.removeChoices(["host/org/unknown"]);
		unsubscribe();

		expect(notified).toBe(0);
	});
});
