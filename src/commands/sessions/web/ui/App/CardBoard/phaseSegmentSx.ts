import { keyframes } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import type { PhaseSegmentState } from "./phaseProgress";
import type { PhaseTone } from "./PhaseTone";
import { toneColor } from "./toneColor";

const pulse = keyframes`
	50% { opacity: 0.45; }
`;

export function phaseSegmentSx(state: PhaseSegmentState, tone: PhaseTone) {
	return (t: Theme) => ({
		flex: 1,
		height: 4,
		borderRadius: "2px",
		bgcolor: {
			done: t.palette.success.main,
			current: currentColor(t, tone),
			failed: t.palette.error.main,
			todo: t.tokens.color.track,
		}[state],
		...(state === "current" &&
			tone === "working" && {
				animation: `${pulse} 1.6s ease-in-out infinite`,
				"@media (prefers-reduced-motion: reduce)": { animation: "none" },
			}),
	});
}

function currentColor(t: Theme, tone: PhaseTone): string {
	if (tone === "working")
		return `color-mix(in srgb, ${t.palette.success.main} 45%, ${t.tokens.color.track})`;
	return toneColor(t, tone);
}
