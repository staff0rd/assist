import { Stack } from "@mui/material";
import type { BacklogItem } from "../types";
import { canPlay } from "./canPlay";
import { DeleteAction } from "./DeleteAction";
import { PlayAction } from "./PlayAction";
import { RefineAction } from "./RefineAction";

export type HeaderContentProps = {
	item: BacklogItem;
	onDeleted: () => Promise<void>;
	onStatusChange: (status: BacklogItem["status"]) => void;
};

export function HeaderActions({
	item,
	onDeleted,
}: Pick<HeaderContentProps, "item" | "onDeleted">) {
	return (
		<Stack direction="row" spacing={1}>
			{canPlay(item) && <PlayAction itemId={item.id} origin={item.origin} />}
			<RefineAction itemId={item.id} />
			<DeleteAction itemId={item.id} onDeleted={onDeleted} />
		</Stack>
	);
}
