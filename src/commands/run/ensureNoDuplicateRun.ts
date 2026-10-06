export function ensureNoDuplicateRun(configs: object[], name: string): void {
	if (configs.some((r) => "name" in r && r.name === name)) {
		console.error(`Run configuration with name "${name}" already exists`);
		process.exit(1);
	}
}
