import { describe, expect, it } from "vitest";
import { classifyLogLine } from "./classifyLogLine";
import { createLogRules } from "./createLogRules";

const logs = {
	services: {
		api: { ignore: ["favicon"] },
		worker: { errorPatterns: ["panic"], ignore: [] },
	},
	browser: { ignore: ["ResizeObserver loop"] },
};

describe("classifyLogLine", () => {
	const rulesFor = createLogRules(logs);

	it.each([
		"ERROR: connection refused",
		"Unhandled exception in handler",
		"FATAL: database down",
	])("flags %s with the default error patterns", (line) => {
		expect(classifyLogLine(line, rulesFor("db"))).toBe("error");
	});

	it("ignores lines that match no error pattern", () => {
		expect(classifyLogLine("GET /health 200", rulesFor("db"))).toBeUndefined();
	});

	it("marks error lines matching the service's ignore list as ignored", () => {
		expect(classifyLogLine("Error: favicon.ico missing", rulesFor("api"))).toBe(
			"ignored",
		);
		expect(classifyLogLine("Error: favicon.ico missing", rulesFor("db"))).toBe(
			"error",
		);
	});

	it("uses a service's own error patterns in place of the defaults", () => {
		expect(classifyLogLine("panic: nil map", rulesFor("worker"))).toBe("error");
		expect(
			classifyLogLine("Error: retrying", rulesFor("worker")),
		).toBeUndefined();
	});

	it("treats every browser message as an error unless ignored", () => {
		expect(classifyLogLine("500 GET /api/x", rulesFor("browser"))).toBe(
			"error",
		);
		expect(
			classifyLogLine(
				"console: ResizeObserver loop limit",
				rulesFor("browser"),
			),
		).toBe("ignored");
	});

	it("names the key holding an invalid pattern", () => {
		const bad = createLogRules({
			...logs,
			services: { api: { ignore: ["("] } },
		});
		expect(() => bad("api")).toThrow(
			'review.instance.logs.services.api.ignore has an invalid pattern "("',
		);
	});
});
