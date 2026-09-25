import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { ConfirmDialog } from "../../../../../../../../../../../../../../../../../../../backlog/web/ui/components/ConfirmDialog";
import { StopCardActivation } from "../../../../../../../../../../../../../StopCardActivation";
import { useServerActionsContext } from "../../../../../../../../../../../../../../useServerActionsContext";

export function DiscardButton({
	id,
	reason,
	path,
	removesTree,
}: {
	id: string;
	reason?: string;
	path?: string;
	removesTree?: boolean;
}) {
	const { onDiscard } = useServerActionsContext();
	const [confirming, setConfirming] = useState(false);
	const held = reason ? ` (${reason})` : "";
	const where = path ?? "its working tree";

	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					setConfirming(true);
				}}
				title={
					removesTree
						? "Discard changes and remove worktree"
						: "Drop this card and stop tracking its unlanded work"
				}
				sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
			>
				<DeleteForeverIcon sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<StopCardActivation>
					<ConfirmDialog
						title={
							removesTree ? "Discard all changes" : "Stop tracking this work"
						}
						message={
							removesTree
								? `This permanently deletes the worktree ${where} and the work it holds${held}. This cannot be undone.`
								: `This drops the card and stops tracking the unlanded work in ${where}${held}. Nothing on disk is deleted.`
						}
						confirmLabel={removesTree ? "Discard changes" : "Drop card"}
						onConfirm={() => {
							setConfirming(false);
							onDiscard(id);
						}}
						onCancel={() => setConfirming(false)}
					/>
				</StopCardActivation>
			)}
		</>
	);
}
