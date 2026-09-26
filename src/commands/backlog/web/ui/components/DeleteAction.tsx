import { Button } from "@mui/material";
import { useState } from "react";
import { deleteItem } from "../api";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
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
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			{confirming && (
				<ConfirmDialog
					onConfirm={async () => {
						await deleteItem(itemId, cwd, node);
						await onDeleted();
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
			<Button
				variant="contained"
				color="error"
				size="small"
				onClick={() => setConfirming(true)}
			>
				Delete
			</Button>
		</>
	);
}
