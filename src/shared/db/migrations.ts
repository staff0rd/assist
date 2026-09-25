import type { Migration } from "./migrations/Migration";
import { migration0001Baseline } from "./migrations/migration0001Baseline";
import { migration0002UsagePeaksContext } from "./migrations/migration0002UsagePeaksContext";
import { migration0003PhaseCycleContext } from "./migrations/migration0003PhaseCycleContext";
import { migration0004DropUsagePeaksContext } from "./migrations/migration0004DropUsagePeaksContext";
import { migration0005PhaseSessions } from "./migrations/migration0005PhaseSessions";
import { migration0006BackfillPhaseSessions } from "./migrations/migration0006BackfillPhaseSessions";
import { migration0007GithubIssue } from "./migrations/migration0007GithubIssue";

export const migrations: readonly Migration[] = [
	migration0001Baseline,
	migration0002UsagePeaksContext,
	migration0003PhaseCycleContext,
	migration0004DropUsagePeaksContext,
	migration0005PhaseSessions,
	migration0006BackfillPhaseSessions,
	migration0007GithubIssue,
];

export const latestMigrationId: number = migrations.reduce(
	(max, m) => Math.max(max, m.id),
	0,
);
