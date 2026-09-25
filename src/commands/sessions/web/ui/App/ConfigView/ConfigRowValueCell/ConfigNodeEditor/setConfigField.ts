type Fields = Record<string, unknown>;

export function setConfigField(
	fields: Fields,
	name: string,
	value: unknown,
): Fields {
	const out: Fields = { ...fields };
	if (value === undefined || value === "") delete out[name];
	else out[name] = value;
	return out;
}

export function renameConfigField(
	fields: Fields,
	index: number,
	name: string,
): Fields {
	return Object.fromEntries(
		Object.entries(fields).map(([key, value], at) => [
			at === index ? name : key,
			value,
		]),
	);
}

export function removeConfigField(fields: Fields, index: number): Fields {
	return Object.fromEntries(
		Object.entries(fields).filter((_entry, at) => at !== index),
	);
}
