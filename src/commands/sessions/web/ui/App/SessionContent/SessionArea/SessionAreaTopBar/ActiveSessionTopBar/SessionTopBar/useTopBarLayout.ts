import { type RefObject, useState } from "react";
import { useElementWidth } from "../../../../../useElementWidth";

export const barGap = 8;

const labelledMinRemaining = 560;
const controlsReserve = 48;
const identityShare = 0.5;

export function useTopBarLayout(barRef: RefObject<HTMLDivElement | null>) {
	const width = useElementWidth(barRef);
	const [identityWidth, setIdentityWidth] = useState(0);
	const floor =
		width === null
			? identityWidth
			: Math.min(identityWidth, Math.max(width - controlsReserve, 0));
	return {
		floor,
		budget: width === null ? null : width * identityShare,
		labelled: width === null || width - floor >= labelledMinRemaining,
		available: width === null ? null : width - floor - barGap,
		setIdentityWidth,
	};
}
