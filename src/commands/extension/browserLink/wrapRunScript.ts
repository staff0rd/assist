export function wrapRunScript(code: string): string {
	return `(async () => {
	const describe = (value) => {
		if (value === undefined) return "undefined";
		if (typeof value === "string") return value;
		try {
			return JSON.stringify(value, null, 2) ?? String(value);
		} catch {
			return String(value);
		}
	};
	try {
		const value = await (async () => {
${code}
		})();
		return { value: describe(value) };
	} catch (error) {
		return { error: error instanceof Error && error.stack ? \`\${error}\\n\${error.stack}\` : String(error) };
	}
})();
`;
}
