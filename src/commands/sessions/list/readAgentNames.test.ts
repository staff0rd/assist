import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { readAgentNames } from "./readAgentNames";

describe("readAgentNames", () => {
	it("maps conversation ids to peer names, skipping unreadable files", () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-names-"));
		fs.writeFileSync(
			path.join(dir, "1.json"),
			JSON.stringify({ sessionId: "conv-1", name: "assist-9-0c" }),
		);
		fs.writeFileSync(path.join(dir, "2.json"), "{");
		fs.writeFileSync(path.join(dir, "1.key"), "x");
		expect(readAgentNames(dir)).toEqual(new Map([["conv-1", "assist-9-0c"]]));
		expect(readAgentNames(path.join(dir, "missing")).size).toBe(0);
	});
});
