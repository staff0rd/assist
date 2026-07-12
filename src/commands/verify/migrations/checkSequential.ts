const MIGRATION_FILE = /^migration(\d+)[A-Za-z0-9]*\.ts$/;

export function migrationFileId(file: string): number | undefined {
	const match = file.match(MIGRATION_FILE);
	return match ? Number(match[1]) : undefined;
}

export function checkSequential(
	migrations: readonly { id: number; name: string }[],
	files: readonly string[],
): string[] {
	const problems: string[] = [];

	const ids = migrations.map((migration) => migration.id);
	for (let i = 0; i < ids.length; i++) {
		const expected = i + 1;
		if (ids[i] !== expected) {
			problems.push(
				`Registered migrations must be numbered 1..N in ascending order; index.ts position ${i} has id ${ids[i]}, expected ${expected}.`,
			);
			break;
		}
	}

	const fileIds = files
		.map(migrationFileId)
		.filter((id): id is number => id !== undefined);
	const fileIdSet = new Set(fileIds);
	if (fileIds.length !== fileIdSet.size)
		problems.push("Two migration files share the same number.");

	const idSet = new Set(ids);
	for (const id of idSet) {
		if (!fileIdSet.has(id))
			problems.push(`Migration ${id} is registered but has no migration file.`);
	}
	for (const id of fileIdSet) {
		if (!idSet.has(id))
			problems.push(
				`A migration file is numbered ${id} but no migration with that id is registered in index.ts.`,
			);
	}

	return problems;
}
