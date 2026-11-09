import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

const mockLocked = vi.fn<() => Promise<boolean>>();
let root: string;

vi.mock("../schema/isSchemaLocked", () => ({
	isSchemaLocked: () => mockLocked(),
}));

vi.mock("../../shared/loadConfig", () => ({
	getProjectRoot: () => root,
}));

import { claudeToolOperations } from "../../shared/harnessAdapters/claudeToolOperations";
import type { ToolOperation } from "../../shared/harnessAdapters/types";
import { decideSchemaGuard as decideWrite } from "./decideSchemaGuard";

const TABLE_MODULE = `import { pgTable, text } from "drizzle-orm/pg-core";\nexport const jobRuns = pgTable("job_runs", { kind: text() });\n`;

function input(
	toolName: string,
	filePath: string,
	toolInput: Record<string, unknown> = {},
): ToolOperation[] {
	return claudeToolOperations({
		toolName,
		toolInput: { file_path: filePath, ...toolInput },
	});
}

async function decideSchemaGuard(operations: ToolOperation[]) {
	const [operation] = operations;
	return operation?.kind === "fileWrite" ? decideWrite(operation) : undefined;
}

describe("decideSchemaGuard", () => {
	beforeAll(() => {
		root = mkdtempSync(join(tmpdir(), "assist-schema-guard-"));
		mkdirSync(join(root, "src/shared/db/migrations"), { recursive: true });
		writeFileSync(join(root, "src/shared/db/items.ts"), TABLE_MODULE);
		writeFileSync(
			join(root, "src/shared/db/recordGitRef.ts"),
			"export function recordGitRef() {}\n",
		);
	});

	afterAll(() => {
		rmSync(root, { recursive: true, force: true });
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockLocked.mockResolvedValue(true);
	});

	it.each([
		"src/shared/db/schema.ts",
		"src/shared/db/migrations.ts",
		"src/shared/db/migrations/migration0011JobRuns.ts",
		"src/shared/db/items.ts",
	])("denies an Edit to %s while locked", async (path) => {
		const reason = await decideSchemaGuard(input("Edit", join(root, path)));
		expect(reason).toContain("assist schema unlock");
	});

	it("denies the a1416 Write of a new table module", async () => {
		const reason = await decideSchemaGuard(
			input("Write", "src/shared/db/jobRuns.ts", { content: TABLE_MODULE }),
		);
		expect(reason).toContain("assist schema unlock");
	});

	it("denies a MultiEdit that adds a pgTable to a db module", async () => {
		const reason = await decideSchemaGuard(
			input("MultiEdit", "src/shared/db/recordGitRef.ts", {
				edits: [{ old_string: "a", new_string: "pgTable(" }],
			}),
		);
		expect(reason).toBeDefined();
	});

	it("allows schema edits while unlocked", async () => {
		mockLocked.mockResolvedValue(false);
		expect(
			await decideSchemaGuard(input("Edit", "src/shared/db/schema.ts")),
		).toBeUndefined();
	});

	it.each([
		"src/shared/db/recordGitRef.ts",
		"src/shared/db/migrations/Migration.ts",
		"src/shared/db/retired/findRetiredTables.ts",
		"src/commands/schema.ts",
	])("ignores %s without checking the lock", async (path) => {
		expect(await decideSchemaGuard(input("Edit", path))).toBeUndefined();
		expect(mockLocked).not.toHaveBeenCalled();
	});

	it("ignores other tools", async () => {
		expect(
			await decideSchemaGuard(input("Read", "src/shared/db/schema.ts")),
		).toBeUndefined();
	});
});
