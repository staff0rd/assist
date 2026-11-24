import { describe, expect, it } from "vitest";
import type { Session } from "../types";
import { autopilotIdleMembers } from "./autopilotIdleMembers";

const session = (over: Partial<Session>): Session =>
	({
		id: "b1",
		autopilot: "s1",
		status: "waiting",
		waitingSince: 5,
		...over,
	}) as Session;

describe("autopilotIdleMembers", () => {
	it("lists a run session idle with nothing pending", () => {
		expect(
			autopilotIdleMembers(
				[
					session({
						activity: {
							itemId: 7,
							phase: 2,
							totalPhases: 2,
						} as Session["activity"],
					}),
				],
				"s1",
			),
		).toEqual([
			{
				sessionId: "b1",
				waitingSince: 5,
				itemId: 7,
				phase: "Review",
				lastMessage: undefined,
			},
		]);
	});

	it("skips the root, other runs, running sessions, pending previews and background tasks", () => {
		const sessions = [
			session({ id: "s1" }),
			session({ autopilot: "s9" }),
			session({ status: "running", waitingSince: null }),
			session({
				pendingPrPreview: { requestId: "r" } as Session["pendingPrPreview"],
			}),
			session({ permissionActive: true }),
			session({ sdkBackgroundTasks: ["live check"] }),
		];
		expect(autopilotIdleMembers(sessions, "s1")).toEqual([]);
	});
});
