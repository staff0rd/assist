import Box from "@mui/material/Box";
import type { OverlayRect } from "./caretFromPoint";

export function DragOverlay({
	rects,
	color,
}: {
	rects: OverlayRect[] | null;
	color: string;
}) {
	if (!rects) return null;
	return (
		<>
			{rects.map((r, i) => (
				<Box
					key={i}
					sx={{
						position: "absolute",
						pointerEvents: "none",
						borderRadius: "2px",
					}}
					style={{
						top: r.top,
						left: r.left,
						width: r.width,
						height: r.height,
						backgroundColor: color,
					}}
				/>
			))}
		</>
	);
}
