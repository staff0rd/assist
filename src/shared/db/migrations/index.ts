import type { Migration } from "./Migration";
import { migration0001Baseline } from "./migration0001Baseline";
import { migration0002UsagePeaksContext } from "./migration0002UsagePeaksContext";
import { migration0003PhaseCycleContext } from "./migration0003PhaseCycleContext";
import { migration0004DropUsagePeaksContext } from "./migration0004DropUsagePeaksContext";

export const migrations: readonly Migration[] = [
	migration0001Baseline,
	migration0002UsagePeaksContext,
	migration0003PhaseCycleContext,
	migration0004DropUsagePeaksContext,
];

export const latestMigrationId: number = migrations.reduce(
	(max, m) => Math.max(max, m.id),
	0,
);
