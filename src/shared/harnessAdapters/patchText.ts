const PATCH_MARKER = "*** Begin Patch";

export function patchText(input: Record<string, unknown>): string | undefined {
	const candidates = [
		input.command,
		input.input,
		input.patch,
		...(Array.isArray(input.command) ? input.command : []),
	];
	return candidates.find(
		(value): value is string =>
			typeof value === "string" && value.includes(PATCH_MARKER),
	);
}
