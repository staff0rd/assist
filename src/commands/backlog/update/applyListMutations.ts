import { parseListIndex } from "./parseListIndex";

export type ListMutationOptions = {
	add?: string[];
	edit?: string[];
	remove?: string;
};

type ListMutationResult =
	| { ok: true; items: string[] }
	| { ok: false; error: string };

/** Flag names used to build clear error messages for each operation. */
export type ListMutationFlags = {
	add: string;
	edit: string;
	remove: string;
};

export function hasListMutations(options: ListMutationOptions): boolean {
	return Boolean(
		(options.add && options.add.length > 0) || options.edit || options.remove,
	);
}

/**
 * Apply granular add/edit/remove mutations to a copy of the current list,
 * using 1-based indices that match the numbering shown in `backlog show`.
 * Edits are applied in place, then removals, then appends, so the supplied
 * indices always refer to the list as it is displayed before the command runs.
 */
export function applyListMutations(
	current: string[],
	options: ListMutationOptions,
	flags: ListMutationFlags,
): ListMutationResult {
	let items = [...current];

	if (options.edit) {
		const [rawIndex, ...textParts] = options.edit;
		if (rawIndex === undefined || textParts.length === 0) {
			return {
				ok: false,
				error: `${flags.edit} requires an index and replacement text.`,
			};
		}
		const parsed = parseListIndex(
			rawIndex,
			items.length,
			`${flags.edit} index`,
		);
		if (!parsed.ok) return parsed;
		items[parsed.index - 1] = textParts.join(" ");
	}

	if (options.remove) {
		const parsed = parseListIndex(
			options.remove,
			items.length,
			`${flags.remove} index`,
		);
		if (!parsed.ok) return parsed;
		items = items.filter((_, i) => i !== parsed.index - 1);
	}

	if (options.add) {
		items.push(...options.add);
	}

	return { ok: true, items };
}
