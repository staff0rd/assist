import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import { DragGrip } from "./DragGrip";
import { ItemCard, type ItemCardProps } from "./ItemCard";

const slotSx = { display: "flow-root", position: "relative" } as const;
const liftedSlotSx = { ...slotSx, zIndex: 5 } as const;

export function SortableItemCard(props: ItemCardProps) {
	const {
		attributes,
		listeners,
		setActivatorNodeRef,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: props.item.id });
	return (
		<Box
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			sx={isDragging ? liftedSlotSx : slotSx}
		>
			<ItemCard
				{...props}
				dragging={isDragging}
				reorderable
				grip={
					<DragGrip
						name={props.item.name}
						handle={{ attributes, listeners, setActivatorNodeRef }}
					/>
				}
			/>
		</Box>
	);
}
