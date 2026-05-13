import { Button } from "@mui/material";
import { useState } from "react";
import { useRepoSelectionContext } from "../../../../sessions/web/ui/RepoSelectionProvider";
import { deleteItem } from "../api";
import { ConfirmDialog } from "./ConfirmDialog";

export function DeleteAction({
	itemId,
	onDeleted,
}: {
	itemId: number;
	onDeleted: () => Promise<void>;
}) {
	const [confirming, setConfirming] = useState(false);
	const { selectedCwd } = useRepoSelectionContext();
	return (
		<>
			{confirming && (
				<ConfirmDialog
					onConfirm={async () => {
						await deleteItem(itemId, selectedCwd || undefined);
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
