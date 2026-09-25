import type { MiroItem } from "../../../../../../../../../miro/types";
import type { AnchorRole } from "../../useMiroAnchorSelection";

const roleColour: Record<AnchorRole, string> = {
	"top-left": "#2e7d32",
	"bottom-right": "#1565c0",
};

type MiroBoxStyle = {
	width: number;
	height: number;
	fontSize: number;
	radius: number;
	colour: string;
	opacity: number;
	strokeWidth: number;
};

export function miroBoxStyle(
	box: MiroItem,
	role: AnchorRole | null,
): MiroBoxStyle {
	const width = box.right - box.left;
	const height = box.bottom - box.top;
	return {
		width,
		height,
		fontSize: Math.max(6, Math.min(height * 0.3, width / 6, 28)),
		radius: Math.min(8, height / 4),
		colour: role ? roleColour[role] : "#546e7a",
		opacity: role ? 0.75 : 0.35,
		strokeWidth: Math.max(1, width * 0.004),
	};
}
