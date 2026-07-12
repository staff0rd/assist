import type { Migration } from "./Migration";
import { migration0001Baseline } from "./migration0001Baseline";

export const migrations: readonly Migration[] = [migration0001Baseline];

export const latestMigrationId: number = migrations.reduce(
	(max, m) => Math.max(max, m.id),
	0,
);
