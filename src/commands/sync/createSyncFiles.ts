import * as fs from "node:fs";
import { createConflictQueue } from "./createConflictQueue";
import { createOwnedSet } from "./createOwnedSet";
import { readTextIfPresent } from "./readTextIfPresent";
import { replaceDir } from "./replaceDir";
import { replaceFile } from "./replaceFile";
import { syncManifest } from "./syncManifest";

export type SyncOwner = {
	owns: (target: string) => boolean;
	forget: (target: string) => void;
};

export type SyncFiles = SyncOwner & {
	write: (target: string, content: string) => void;
	copyDir: (source: string, target: string) => void;
	remove: (target: string, knownContents: string[]) => void;
	finish: (yes: boolean) => Promise<void>;
};

export function createSyncFiles(initial = syncManifest.load()): SyncFiles {
	const { files, owns, claim, forget } = createOwnedSet(initial);
	const { guard, resolve } = createConflictQueue(owns);
	const claimAfter = (target: string, run: () => void) => () => {
		run();
		claim(target);
	};

	return {
		owns,
		forget,
		write: (target, content) =>
			guard(
				{
					target,
					action: "overwrite",
					run: claimAfter(target, () => replaceFile(target, content)),
				},
				() => readTextIfPresent(target) === content,
			),
		copyDir: (source, target) =>
			guard(
				{
					target,
					action: "overwrite",
					run: claimAfter(target, () => replaceDir(source, target)),
				},
				() => false,
			),
		remove(target, knownContents) {
			if (!fs.existsSync(target)) return;
			const run = () => {
				fs.rmSync(target, { force: true });
				forget(target);
			};
			guard({ target, action: "delete", run }, () =>
				knownContents.includes(readTextIfPresent(target) ?? ""),
			);
		},
		async finish(yes) {
			await resolve(yes);
			syncManifest.save(files());
		},
	};
}
