import { normalizeDependsOn } from "./normalizeDependsOn";
import { resolveDependsOn } from "./resolveDependsOn";

type Remap = {
	/** Each phase's stored 0-based dependencies before the change, by old idx. */
	before: readonly (readonly number[] | null)[];
	/** For each new position, the old idx of the phase now there, or undefined for a new phase. */
	order: readonly (number | undefined)[];
	/** Stored dependencies (new numbering) for the phase inserted at an undefined slot. */
	inserted?: readonly number[] | null;
};

/**
 * Carry stored dependencies through an insert, move or removal. Phases on the
 * default (previous phase) keep it. Explicit references follow their phase to
 * its new position; a reference to a removed phase, or to one that is no longer
 * earlier, is replaced by that phase's own dependencies so ordering still holds.
 */
export function remapDependsOn({
	before,
	order,
	inserted = null,
}: Remap): (number[] | null)[] {
	const newPosition = new Map<number, number>();
	order.forEach((oldIdx, pos) => {
		if (oldIdx !== undefined) newPosition.set(oldIdx, pos);
	});

	const expand = (oldIdx: number, pos: number, seen: Set<number>): number[] => {
		const target = newPosition.get(oldIdx);
		if (target !== undefined && target < pos) return [target];
		if (seen.has(oldIdx)) return [];
		seen.add(oldIdx);
		return resolveDependsOn(before[oldIdx], oldIdx).flatMap((dep) =>
			expand(dep, pos, seen),
		);
	};

	return order.map((oldIdx, pos) => {
		if (oldIdx === undefined) return normalizeDependsOn(inserted, pos);
		const stored = before[oldIdx];
		if (!stored) return null;
		const seen = new Set<number>([oldIdx]);
		return normalizeDependsOn(
			stored.flatMap((dep) => expand(dep, pos, seen)),
			pos,
		);
	});
}
