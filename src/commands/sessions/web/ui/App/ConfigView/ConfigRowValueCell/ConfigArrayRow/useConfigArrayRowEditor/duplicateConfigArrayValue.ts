export function duplicateConfigArrayValue(value: unknown): unknown {
	const copy = structuredClone(value ?? {});
	if (
		copy !== null &&
		typeof copy === "object" &&
		!Array.isArray(copy) &&
		"name" in copy &&
		typeof copy.name === "string"
	) {
		return { ...copy, name: `${copy.name}-copy` };
	}
	return copy;
}
