export function normaliseCode(code: string): string {
	return code
		.replace(/\s+/g, " ")
		.trim()
		.replace(/ (?=[^\w$])|(?<=[^\w$]) /g, "")
		.replace(/;+$/, "");
}
