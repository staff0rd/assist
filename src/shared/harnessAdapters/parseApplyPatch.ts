type PatchedFile = { path: string; contents: string[] };

const FILE_HEADER = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/;
const MOVE_TO = /^\*\*\* Move to: (.+)$/;

export function parseApplyPatch(patch: string): PatchedFile[] {
	const files: { path: string; added: string[] }[] = [];
	let added: string[] | undefined;
	for (const line of patch.split(/\r?\n/)) {
		const header = FILE_HEADER.exec(line);
		if (header) {
			added = [];
			files.push({ path: header[1].trim(), added });
			continue;
		}
		const move = MOVE_TO.exec(line);
		if (move && added) {
			files.push({ path: move[1].trim(), added });
			continue;
		}
		if (added && line.startsWith("+")) added.push(line.slice(1));
	}
	return files.map(({ path, added: lines }) => ({
		path,
		contents: lines.length ? [lines.join("\n")] : [],
	}));
}
