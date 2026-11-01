import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../shared/isApprovedRead", () => ({
	isApprovedRead: (cmd: string) =>
		/^(cat|grep|sed -n) [^>]*$/.test(cmd) ? "Read-only CLI command" : undefined,
}));

import { findSchemaPathDeny } from "./findSchemaPathDeny";

let root: string;

const TABLE_MODULE = `import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const jobRuns = pgTable("job_runs", {
	id: integer().primaryKey(),
	kind: text().notNull(),
});
`;

const A1416_HEREDOC = `cat > src/shared/db/jobRuns.ts <<'EOF'
${TABLE_MODULE}EOF
cat > src/shared/db/migrations/migration0011JobRuns.ts <<'EOF'
import type { Migration } from "./Migration";

export const migration0011JobRuns: Migration = {
	id: 11,
	name: "job runs",
	sql: "CREATE TABLE IF NOT EXISTS job_runs (id INTEGER PRIMARY KEY)",
};
EOF`;

function deny(command: string) {
	return findSchemaPathDeny("Bash", command, root);
}

describe("findSchemaPathDeny", () => {
	beforeAll(() => {
		root = mkdtempSync(join(tmpdir(), "assist-schema-deny-"));
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

	it("denies the a1416 heredoc that wrote a new table module and migration", () => {
		const decision = deny(A1416_HEREDOC);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist schema unlock",
		);
	});

	it.each([
		"sed -i 's/a/b/' src/shared/db/schema.ts",
		"echo x >> src/shared/db/migrations.ts",
		"cp /tmp/m.ts src/shared/db/migrations/migration0012Feature.ts",
		"mv src/shared/db/items.ts src/shared/db/itemsOld.ts",
		"sed -i 's/a/b/' src/shared/db/items.ts",
		"rm ./src/shared/db/schema.ts",
		"git checkout -- src/shared/db/schema.ts",
	])("denies the write %s", (command) => {
		expect(deny(command)?.permissionDecision).toBe("deny");
	});

	it("denies an absolute path under the project root", () => {
		expect(
			deny(`sed -i 's/a/b/' ${root}/src/shared/db/schema.ts`)
				?.permissionDecision,
		).toBe("deny");
	});

	it.each([
		"cat src/shared/db/schema.ts",
		"grep -n pgTable src/shared/db/items.ts",
		"sed -n '1,20p' src/shared/db/migrations.ts",
		"cat src/shared/db/migrations/migration0011JobRuns.ts",
	])("allows the read-only %s", (command) => {
		expect(deny(command)).toBeUndefined();
	});

	it.each([
		"sed -i 's/a/b/' src/shared/db/recordGitRef.ts",
		"echo x > src/shared/db/listJobRuns.ts",
		"sed -i 's/a/b/' src/shared/db/migrations/Migration.ts",
		"rm -rf dist",
	])("ignores %s, which writes no schema file", (command) => {
		expect(deny(command)).toBeUndefined();
	});
});
