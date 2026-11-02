const UNSHIPPED = /^(META-INF\/|updates\.json$)/;

function withoutVersion(manifest: Buffer): string {
	const { version: _, ...rest } = JSON.parse(manifest.toString("utf8")) as {
		version?: string;
	};
	return JSON.stringify(rest);
}

function sameFile(path: string, a: Buffer, b: Buffer): boolean {
	if (path === "manifest.json") return withoutVersion(a) === withoutVersion(b);
	return a.equals(b);
}

export function changedBundleFiles(
	built: Map<string, Buffer>,
	signed: Map<string, Buffer>,
): string[] {
	const paths = new Set([...built.keys(), ...signed.keys()]);
	return [...paths]
		.filter((path) => !UNSHIPPED.test(path))
		.filter((path) => {
			const a = built.get(path);
			const b = signed.get(path);
			return !a || !b || !sameFile(path, a, b);
		})
		.sort();
}
