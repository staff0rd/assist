import { describe, expect, it } from "vitest";
import { lineRecorder } from "./lineRecorder";

describe("lineRecorder", () => {
	it("emits each complete, non-blank line once, stripped of ANSI", () => {
		const lines: string[] = [];
		const record = lineRecorder((line) => lines.push(line));

		record("waiting on ori");
		record("gin/main …\r\n\r\n\x1b[32mpulled\x1b[0m\n");

		expect(lines).toEqual(["waiting on origin/main …", "pulled"]);
	});
});
