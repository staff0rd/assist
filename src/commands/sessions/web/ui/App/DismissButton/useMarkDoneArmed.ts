import { useState } from "react";
import { useModifiersHeld } from "../../useModifiersHeld";
import { isMarkDoneChord } from "./isMarkDoneChord";

export function useMarkDoneArmed(enabled: boolean) {
	const [hovered, setHovered] = useState(false);
	const chordHeld = useModifiersHeld(isMarkDoneChord);
	return {
		armed: enabled && hovered && chordHeld,
		hoverHandlers: {
			onMouseEnter: () => setHovered(true),
			onMouseLeave: () => setHovered(false),
		},
	};
}
