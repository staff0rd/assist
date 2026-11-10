import { useContext, useState } from "react";
import type { HunkData } from "react-diff-view";
import type { GapDirection } from "./gapAt";
import { headSourceContext } from "./headSourceContext";
import { type Expanded, expandedFrom } from "./useGapExpansion/expandedFrom";
import { type ForBase, forBase } from "./useGapExpansion/forBase";
import { type GapError, gapError } from "./useGapExpansion/gapError";

export type GapExpansion = {
	hunks: HunkData[];
	headLength: number | undefined;
	expandable: boolean;
	from: string | undefined;
	loading: number | null;
	error: GapError | null;
	expand: (index: number, direction: GapDirection) => void;
};

export function useGapExpansion(
	path: string,
	base: HunkData[],
	enabled: boolean,
): GapExpansion {
	const source = useContext(headSourceContext);
	const [expanded, setExpanded] = useState<Expanded | null>(null);
	const [headLength, setHeadLength] = useState<ForBase<number> | null>(null);
	const [loading, setLoading] = useState<ForBase<number> | null>(null);
	const [error, setError] = useState<ForBase<GapError> | null>(null);
	const hunks = expanded?.base === base ? expanded.hunks : base;

	const expand = (index: number, direction: GapDirection) => {
		if (!source) return;
		setLoading({ base, value: index });
		setError(null);
		source
			.load(path)
			.then((lines) => {
				setHeadLength({ base, value: lines.length });
				setExpanded((previous) =>
					expandedFrom(previous, base, lines, index, direction),
				);
			})
			.catch((error: unknown) =>
				setError({ base, value: gapError(error, index, direction) }),
			)
			.finally(() => setLoading(null));
	};

	return {
		hunks,
		headLength: forBase(headLength, base),
		expandable: enabled && source !== undefined,
		from: source?.from,
		loading: forBase(loading, base) ?? null,
		error: forBase(error, base) ?? null,
		expand,
	};
}
