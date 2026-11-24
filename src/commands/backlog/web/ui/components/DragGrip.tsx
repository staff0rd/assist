import type { useSortable } from "@dnd-kit/sortable";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Box, type Theme } from "@mui/material";
import { dragGripClass } from "./dragGripClass";

type DragHandle = Pick<
	ReturnType<typeof useSortable>,
	"attributes" | "listeners" | "setActivatorNodeRef"
>;

const gripSx = (theme: Theme) => ({
	display: "grid",
	placeItems: "center",
	position: "relative",
	zIndex: 2,
	width: theme.tokens.density.iconButton.smallIcon * 1.5,
	height: theme.tokens.density.iconButton.side,
	p: 0,
	ml: -1,
	border: 0,
	borderRadius: 1,
	bgcolor: "transparent",
	color: "text.disabled",
	cursor: "grab",
	touchAction: "none",
	transition: "color 0.2s, background-color 0.2s",
	"& svg": { fontSize: theme.tokens.density.iconButton.smallIcon },
});

export function DragGrip({
	name,
	handle: { attributes, listeners, setActivatorNodeRef },
}: {
	name: string;
	handle: DragHandle;
}) {
	return (
		<Box
			component="button"
			type="button"
			ref={setActivatorNodeRef}
			className={dragGripClass}
			sx={gripSx}
			{...attributes}
			{...listeners}
			tabIndex={-1}
			aria-label={`Reorder ${name}`}
		>
			<DragIndicatorIcon />
		</Box>
	);
}
