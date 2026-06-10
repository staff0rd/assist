import { describe, expect, it } from "vitest";
import { sessionTitle } from "./sessionTitle";
import type { SessionInfo } from "./types";

function makeSession(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "1",
		name: "fallback",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

describe("sessionTitle", () => {
	it("shows the first arg (slash command) for assist sessions", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["draft", "--once"],
			name: "assist draft --once",
		});

		expect(sessionTitle(session)).toBe("draft");
	});

	it("falls back to the name when an assist session has no args", () => {
		const session = makeSession({ commandType: "assist", name: "assist" });

		expect(sessionTitle(session)).toBe("assist");
	});

	it("shows 'run: <name>' for run sessions", () => {
		const session = makeSession({
			commandType: "run",
			runName: "build",
			name: "run: build",
		});

		expect(sessionTitle(session)).toBe("run: build");
	});

	it("shows the prompt-derived name for claude sessions", () => {
		const session = makeSession({ commandType: "claude", name: "fix the bug" });

		expect(sessionTitle(session)).toBe("fix the bug");
	});

	it("shows the entered prompt text for an assist session when provided", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["draft", "--once", "add dark mode"],
		});

		expect(sessionTitle(session)).toBe("add dark mode");
	});

	it("shows the item name for a backlog activity (id is shown as a chip)", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["next", "--once"],
			activity: {
				kind: "backlog",
				itemId: 129,
				itemName: "Session card type",
				phase: 2,
				totalPhases: 3,
				startedAt: 0,
			},
		});

		expect(sessionTitle(session)).toBe("Session card type");
	});

	it("shows the item name for a refine session (id is shown as a chip)", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["refine", "--once", "254"],
			activity: {
				kind: "command",
				name: "refine 254",
				itemId: 254,
				itemName: "Add refine mode button",
				startedAt: 0,
			},
		});

		expect(sessionTitle(session)).toBe("Add refine mode button");
	});
});
