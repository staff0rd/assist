import { describe, expect, it } from "vitest";
import { findSchemaPathDeny } from "./findSchemaPathDeny";

const A1416_HEREDOC = `cat > src/shared/db/jobRuns.ts <<'EOF'
import { integer, pgTable } from "drizzle-orm/pg-core";
export const jobRuns = pgTable("job_runs", { id: integer().primaryKey() });
EOF
cat > src/shared/db/migrations/migration0011JobRuns.ts <<'EOF'
export const migration0011JobRuns = { id: 11 };
EOF`;

const A1690_COMMAND = `cd /home/stafford/git/assist-4/src && cat > shared/db/migrations/migration0013PhaseRunState.ts <<'EOF'
import type { Migration } from "./Migration";

export const migration0013PhaseRunState: Migration = {
	id: 13,
	name: "phase run state",
	sql: "ALTER TABLE plan_phases ADD COLUMN IF NOT EXISTS run_state TEXT",
};
EOF
python3 - <<'PY'
p = 'shared/db/migrations.ts'
s = open(p).read()
s = s.replace('migration0012', 'migration0012, migration0013PhaseRunState')
open(p, 'w').write(s)
p = 'shared/db/planPhases.ts'
s = open(p).read()
s = s.replace('currentPhase', 'currentPhase, runState')
open(p, 'w').write(s)
PY`;

describe("findSchemaPathDeny", () => {
	it.each([
		["the a1690 command verbatim", A1690_COMMAND],
		["the a1416 heredoc", A1416_HEREDOC],
	])("denies %s with the schema lock reason", (_, command) => {
		const decision = findSchemaPathDeny(command);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist schema unlock",
		);
	});

	it.each([
		"cd src && cat > shared/db/migrations/migration0099X.ts <<'EOF'\nx\nEOF",
		"cd src/shared/db && cat > migrations/migration0099X.ts <<'EOF'\nx\nEOF",
		"cd src && python3 -c \"open('shared/db/schema.ts','w').write('x')\"",
		"cd src && node -e \"fs.writeFileSync('shared/db/items.ts','x')\"",
		"cd src/shared/db && python3 -c \"open('migrations/migration0099X.ts','w')\"",
		"cd src/shared/db && python3 -c \"open('schema.ts','w').write('x')\"",
		"cd src/shared/db; sed -i 's/a/b/' schema.ts",
		String.raw`cd src\shared\db && echo x > schema.ts`,
		"sed -i 's/a/b/' src/shared/db/schema.ts",
		"cp /tmp/m.ts src/shared/db/migrations/migration0012Feature.ts",
		String.raw`rm .\src\shared\db\schema.ts`,
		"cat src/shared/db/schema.ts",
		"sed -n '1,20p' src/shared/db/migrations.ts",
	])("denies %s", (command) => {
		expect(findSchemaPathDeny(command)?.permissionDecision).toBe("deny");
	});

	it.each([
		"rm -rf dist",
		"cd src && cat commands/schema/isSchemaPath.ts",
		"grep -rn migrations src/commands",
		"cat src/shared/dbHelpers.ts",
	])("ignores %s, which names no db path", (command) => {
		expect(findSchemaPathDeny(command)).toBeUndefined();
	});
});
