import { describe, expect, it } from "vitest";
import { launcherEnv } from "./launcherEnv";

describe("launcherEnv", () => {
	it("forwards the launcher's own ASSIST_ vars, not the daemon-owned ones", () => {
		expect(
			launcherEnv({
				PATH: "/bin",
				ASSIST_BACKLOG_ITEM_ID: "42",
				ASSIST_RESUME_IDLE: "1",
				ASSIST_SESSION: "1",
				ASSIST_SESSION_ID: "3",
				ASSIST_ACTIVITY_ID: "3",
				ASSIST_SDK_SESSION: "1",
			}),
		).toEqual({ ASSIST_BACKLOG_ITEM_ID: "42", ASSIST_RESUME_IDLE: "1" });
	});
});
