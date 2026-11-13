import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readProposedItem } from "./readProposedItem";

const payload = {
	name: "Preview blocks on approval",
	type: "bug",
	description: "**Repro:**\n\n1. Do a thing",
	acceptanceCriteria: ["It blocks"],
};

function writePayload(content: unknown): string {
	const dir = mkdtempSync(join(tmpdir(), "assist-propose-"));
	const file = join(dir, "item.json");
	writeFileSync(
		file,
		typeof content === "string" ? content : JSON.stringify(content),
	);
	return file;
}

afterEach(() => {
	vi.restoreAllMocks();
});

function expectFailure() {
	const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
	return errorSpy;
}

describe("readProposedItem", () => {
	it("reads and validates a payload from a file", async () => {
		expect(await readProposedItem(writePayload(payload))).toEqual({
			...payload,
			phases: [],
		});
	});

	it("reads a payload from stdin", async () => {
		vi.spyOn(process, "stdin", "get").mockReturnValue(
			Readable.from([JSON.stringify(payload)]) as typeof process.stdin,
		);

		expect(await readProposedItem("-")).toEqual({ ...payload, phases: [] });
	});

	it("defaults acceptance criteria and phases to empty lists", async () => {
		const item = await readProposedItem(
			writePayload({ name: "n", type: "story" }),
		);

		expect(item.acceptanceCriteria).toEqual([]);
		expect(item.phases).toEqual([]);
	});

	it("reads phases with their tasks and manual checks", async () => {
		const item = await readProposedItem(
			writePayload({
				name: "n",
				type: "story",
				phases: [
					{ name: "Wire it up", tasks: ["Add the pane"] },
					{
						name: "Polish",
						tasks: ["Tidy the chip"],
						manualChecks: ["Open the pane"],
					},
				],
			}),
		);

		expect(item.phases).toEqual([
			{ name: "Wire it up", tasks: ["Add the pane"], manualChecks: [] },
			{
				name: "Polish",
				tasks: ["Tidy the chip"],
				manualChecks: ["Open the pane"],
			},
		]);
	});

	it("exits non-zero when a phase has no tasks", async () => {
		const errorSpy = expectFailure();

		await expect(
			readProposedItem(
				writePayload({
					name: "n",
					type: "story",
					phases: [{ name: "Empty", tasks: [] }],
				}),
			),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("at least one task");
	});

	it("exits non-zero when a phase is named Review", async () => {
		const errorSpy = expectFailure();

		await expect(
			readProposedItem(
				writePayload({
					name: "n",
					type: "story",
					phases: [
						{ name: "Fix", tasks: ["t"] },
						{ name: "review", tasks: ["verify it"] },
					],
				}),
			),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain(
			"appended to every plan automatically",
		);
	});

	it.each([
		"Phase 1: make the fix",
		"phase 2 - add tests",
		"**Phase 3:** polish",
		"Phase 1 — wire it up",
	])(
		"exits non-zero when an acceptance criterion reads as a phase: %s",
		async (criterion) => {
			const errorSpy = expectFailure();

			await expect(
				readProposedItem(
					writePayload({
						name: "n",
						type: "bug",
						acceptanceCriteria: ["It works", criterion],
					}),
				),
			).rejects.toThrow("process.exit");
			const output = errorSpy.mock.calls.join("\n");
			expect(output).toContain("acceptanceCriteria.1");
			expect(output).toContain("move it to `phases`");
		},
	);

	it("accepts acceptance criteria that mention phases without defining one", async () => {
		const criteria = [
			"The phase 1 summary is shown",
			"Phases appear in the plan, not the criteria",
		];

		const item = await readProposedItem(
			writePayload({ name: "n", type: "bug", acceptanceCriteria: criteria }),
		);

		expect(item.acceptanceCriteria).toEqual(criteria);
	});

	it("exits non-zero on an unknown field inside a phase", async () => {
		const errorSpy = expectFailure();

		await expect(
			readProposedItem(
				writePayload({
					name: "n",
					type: "story",
					phases: [{ name: "P", tasks: ["t"], checks: ["oops"] }],
				}),
			),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("checks");
	});

	it("exits non-zero when the payload is not valid JSON", async () => {
		const errorSpy = expectFailure();

		await expect(readProposedItem(writePayload("{ nope"))).rejects.toThrow(
			"process.exit",
		);
		expect(errorSpy.mock.calls.join("\n")).toContain("not valid JSON");
	});

	it("exits non-zero and names the offending field on a schema failure", async () => {
		const errorSpy = expectFailure();

		await expect(
			readProposedItem(writePayload({ name: "n", type: "epic" })),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("type");
	});

	it("exits non-zero on an unknown field", async () => {
		const errorSpy = expectFailure();

		await expect(
			readProposedItem(writePayload({ name: "n", type: "story", plan: [] })),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("plan");
	});

	it("exits non-zero when the file cannot be read", async () => {
		const errorSpy = expectFailure();

		await expect(readProposedItem("/no/such/payload.json")).rejects.toThrow(
			"process.exit",
		);
		expect(errorSpy.mock.calls.join("\n")).toContain("Cannot read the payload");
	});
});
