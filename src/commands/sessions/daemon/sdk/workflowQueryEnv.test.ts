import { describe, expect, it } from "vitest";
import { workflowQueryEnv } from "./workflowQueryEnv";

describe("workflowQueryEnv", () => {
	it("keeps the interactive session env when no launcher env is given", () => {
		const env = workflowQueryEnv({ PATH: "/bin" }, "3", undefined);
		expect(env).toMatchObject({
			ASSIST_SESSION_ID: "3",
			ASSIST_ACTIVITY_ID: "3",
		});
	});

	it("adds the launcher's env and drops the activity id for a workflow query", () => {
		const env = workflowQueryEnv({ PATH: "/bin", CLAUDECODE: "1" }, "3", {
			ASSIST_BACKLOG_ITEM_ID: "42",
		});
		expect(env).toEqual({
			PATH: "/bin",
			ASSIST_SESSION: "1",
			ASSIST_SESSION_ID: "3",
			ASSIST_BACKLOG_ITEM_ID: "42",
		});
	});
});
