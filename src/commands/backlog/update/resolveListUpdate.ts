import {
	applyListMutations,
	hasListMutations,
	type ListMutationFlags,
	type ListMutationOptions,
} from "./applyListMutations";

export type ResolvedList = { items?: string[] };
type ListResult = (ResolvedList & { ok: true }) | { ok: false; error: string };

/**
 * Resolve the final list for a field from either the whole-list flag or the
 * granular add/edit/remove flags. Returns an error when both styles are
 * combined or when a granular index is invalid. When neither is supplied the
 * resolved list is `undefined`, signalling "leave this field untouched".
 */
export function resolveListUpdate(
	whole: string[] | undefined,
	current: string[],
	mutations: ListMutationOptions,
	wholeFlag: string,
	flags: ListMutationFlags,
): ListResult {
	if (!hasListMutations(mutations)) return { ok: true, items: whole };
	if (whole) {
		return {
			ok: false,
			error: `Cannot combine ${wholeFlag} with ${flags.add}/${flags.edit}/${flags.remove}.`,
		};
	}
	return applyListMutations(current, mutations, flags);
}
