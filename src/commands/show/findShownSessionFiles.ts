type Locations = { home: string; cwd: string };

const NOT_AFTER = String.raw`(?![\w\-/]|\.\w)`;
const NOT_BEFORE_RELATIVE = String.raw`(?<=^|[^\w.\-/~]|(?:^|[^\w.\-/~])\./)`;

function normalise(path: string): string {
	return path.replaceAll("\\", "/").replace(/\/+$/, "");
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function within(path: string, dir: string): string | undefined {
	return dir && path.startsWith(`${dir}/`)
		? path.slice(dir.length + 1)
		: undefined;
}

function referencePatterns(path: string, { home, cwd }: Locations): RegExp[] {
	const file = normalise(path);
	const forms = [escapeRegExp(file)];
	const drive = /^\/mnt\/([a-z])\/(.+)$/i.exec(file);
	if (drive)
		forms.push(
			`(?:${drive[1]}|${drive[1].toUpperCase()}):/${escapeRegExp(drive[2])}`,
		);
	const underHome = within(file, normalise(home));
	if (underHome) forms.push(`~/${escapeRegExp(underHome)}`);
	const patterns = forms.map((form) => new RegExp(`${form}${NOT_AFTER}`));
	const relative = within(file, normalise(cwd));
	if (relative)
		patterns.push(
			new RegExp(`${NOT_BEFORE_RELATIVE}${escapeRegExp(relative)}${NOT_AFTER}`),
		);
	return patterns;
}

export function findShownSessionFiles(
	body: string,
	writtenPaths: string[],
	locations: Locations,
): string[] {
	const text = body.replaceAll("\\", "/");
	return writtenPaths.filter((path) =>
		referencePatterns(path, locations).some((pattern) => pattern.test(text)),
	);
}
