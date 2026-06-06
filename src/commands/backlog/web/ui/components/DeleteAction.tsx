import { Button } from "@mui/material";
import { useState } from "react";
import { deleteItem } from "../api";
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
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			{confirming && (
				<ConfirmDialog
					onConfirm={async () => {
						await deleteItem(itemId, cwd);
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
