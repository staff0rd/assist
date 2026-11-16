import { type Grouped, repoGroupKey } from "../../repoGroupKey";

export function filterByRepo<T extends Grouped>(
	items: T[],
	repo: string | null,
): T[] {
	if (repo === null) return items;
	return items.filter((item) => repoGroupKey(item) === repo);
}
