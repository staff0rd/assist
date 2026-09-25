import Box from "@mui/material/Box";
import type { MiroItem } from "../../../../../../../../../../../../../miro/types";
import { MiroBoardBox } from "./MiroBoardCanvas/MiroBoardBox";
import { miroBoardViewBox } from "./MiroBoardCanvas/miroBoardViewBox";
import type { MiroAnchorSelection } from "./useMiroAnchorSelection";

export function MiroBoardCanvas({
	boxes,
	selection,
}: {
	boxes: MiroItem[];
	selection: MiroAnchorSelection;
}) {
	return (
		<Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2 }}>
			<svg
				role="img"
				aria-label="Miro board boxes"
				viewBox={miroBoardViewBox(boxes)}
				preserveAspectRatio="xMidYMid meet"
				style={{ width: "100%", height: "100%" }}
			>
				{boxes.map((box) => (
					<MiroBoardBox
						key={box.id}
						box={box}
						role={selection.roleOf(box.id)}
						onSelect={selection.choose}
					/>
				))}
			</svg>
		</Box>
	);
}
