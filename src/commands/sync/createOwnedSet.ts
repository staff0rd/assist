import * as path from "node:path";

export function createOwnedSet(initial: string[]) {
	const owned = new Set(initial.map((file) => path.resolve(file)));
	return {
		files: () => owned.values(),
		owns: (target: string) => owned.has(path.resolve(target)),
		claim: (target: string) => {
			owned.add(path.resolve(target));
		},
		forget: (target: string) => {
			owned.delete(path.resolve(target));
		},
	};
}
