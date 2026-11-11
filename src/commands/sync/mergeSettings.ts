type Json = unknown;

function isPlainObject(value: Json): value is Record<string, Json> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonical(value: Json): string {
	if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
	if (isPlainObject(value))
		return `{${Object.keys(value)
			.sort()
			.map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
			.join(",")}}`;
	return JSON.stringify(value);
}

function unionArrays(user: Json[], assist: Json[]): Json[] {
	const seen = new Set(user.map(canonical));
	const merged = [...user];
	for (const entry of assist) {
		const key = canonical(entry);
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(entry);
	}
	return merged;
}

function mergeValue(user: Json, assist: Json): Json {
	if (isPlainObject(user) && isPlainObject(assist))
		return mergeSettings(user, assist);
	if (Array.isArray(user) && Array.isArray(assist))
		return unionArrays(user, assist);
	return assist;
}

export function mergeSettings(
	user: Record<string, Json>,
	assist: Record<string, Json>,
): Record<string, Json> {
	const merged: Record<string, Json> = { ...user };
	for (const [key, value] of Object.entries(assist))
		merged[key] = key in merged ? mergeValue(merged[key], value) : value;
	return merged;
}
