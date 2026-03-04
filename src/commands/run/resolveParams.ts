type Param = { name: string; required?: boolean; default?: string };

export function resolveParams(
	params: Param[] | undefined,
	cliArgs: string[],
): string[] {
	if (!params || params.length === 0) return cliArgs;

	const resolved: string[] = [];
	const missing: string[] = [];

	for (let i = 0; i < params.length; i++) {
		const param = params[i];
		const value = cliArgs[i] ?? param.default;
		if (value !== undefined) {
			resolved.push(value);
		} else if (param.required) {
			missing.push(param.name);
		}
	}

	if (missing.length > 0) {
		const s = missing.length > 1 ? "s" : "";
		const names = missing.map((n) => `"${n}"`).join(", ");
		console.error(`Missing required param${s}: ${names}`);
		process.exit(1);
	}

	resolved.push(...cliArgs.slice(params.length));
	return resolved;
}
