import { applyListMutations, hasListMutations } from "./applyListMutations";

type AcMutationOptions = {
	addAc?: string[];
	editAc?: string[];
	removeAc?: string;
};

type AcMutationResult =
	| { ok: true; criteria: string[] }
	| { ok: false; error: string };

export function hasAcMutations(options: AcMutationOptions): boolean {
	return hasListMutations({
		add: options.addAc,
		edit: options.editAc,
		remove: options.removeAc,
	});
}

/**
 * Apply granular acceptance-criteria mutations to a copy of the current list,
 * using 1-based indices that match the numbering shown in `backlog show`.
 */
export function applyAcMutations(
	current: string[],
	options: AcMutationOptions,
): AcMutationResult {
	const result = applyListMutations(
		current,
		{ add: options.addAc, edit: options.editAc, remove: options.removeAc },
		{ add: "--add-ac", edit: "--edit-ac", remove: "--remove-ac" },
	);
	if (!result.ok) return result;
	return { ok: true, criteria: result.items };
}
