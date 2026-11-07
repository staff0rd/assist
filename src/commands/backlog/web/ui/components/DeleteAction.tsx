import { Button } from "@mui/material";
import { deleteItem } from "../api";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { useShiftSkipConfirm } from "../../../../sessions/web/ui/useShiftSkipConfirm";
import { useRepoCwd } from "../useRepoCwd";
import { ConfirmDialog } from "./ConfirmDialog";

export function DeleteAction({
	itemId,
	onDeleted,
}: {
	itemId: number;
	onDeleted: () => Promise<void>;
}) {
	const cwd = useRepoCwd();
	const node = useApiNode();
	const remove = async () => {
		await deleteItem(itemId, cwd, node);
		await onDeleted();
	};
	const { confirming, close, triggerHandlers, withHint } = useShiftSkipConfirm(
		() => void remove(),
	);
	return (
		<>
			{confirming && <ConfirmDialog onConfirm={remove} onCancel={close} />}
			<Button
				variant="outlined"
				color="error"
				size="small"
				{...triggerHandlers}
				title={withHint("Delete item")}
			>
				Delete
			</Button>
		</>
	);
}
