import { canonical } from "./canonical";
import { isPlainObject } from "./isPlainObject";

type Json = unknown;

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
