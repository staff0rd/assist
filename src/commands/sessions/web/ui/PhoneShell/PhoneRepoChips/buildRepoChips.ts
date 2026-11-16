import { repoLabel } from "../../App/repoLabel";
import { type Grouped, repoGroupKey } from "../../repoGroupKey";

export type RepoChip = {
	key: string;
	label: string;
	count: number;
	attention: boolean;
};

export function buildRepoChips<T extends Grouped>(
	items: T[],
	selected: string | null,
	needsAttention: (item: T) => boolean = () => false,
): RepoChip[] {
	const chips = new Map<string, RepoChip>();
	const chipFor = (key: string) => {
		let chip = chips.get(key);
		if (!chip) {
			chip = { key, label: repoLabel(key), count: 0, attention: false };
			chips.set(key, chip);
		}
		return chip;
	};
	for (const item of items) {
		const key = repoGroupKey(item);
		if (!key) continue;
		const chip = chipFor(key);
		chip.count++;
		if (needsAttention(item)) chip.attention = true;
	}
	if (selected !== null) chipFor(selected);
	return [...chips.values()].sort(
		(a, b) =>
			b.count - a.count ||
			a.label.localeCompare(b.label) ||
			a.key.localeCompare(b.key),
	);
}
