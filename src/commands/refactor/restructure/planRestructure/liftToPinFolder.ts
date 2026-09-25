import path from "node:path";

export function liftToPinFolder(
	dir: string,
	pinFolders: Set<string>,
	scopeRoot: string,
): string {
	let lifted = scopeRoot;
	for (const folder of pinFolders)
		if (
			(dir === folder || dir.startsWith(folder + path.sep)) &&
			folder.length > lifted.length
		)
			lifted = folder;
	return lifted;
}
