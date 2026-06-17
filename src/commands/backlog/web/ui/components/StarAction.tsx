import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { IconButton, Tooltip } from "@mui/material";
import { type MouseEvent, useState } from "react";
import { toggleStar } from "../api";
import { useRepoCwd } from "../useRepoCwd";

export function StarAction({
	itemId,
	starred,
	onToggled,
}: {
	itemId: number;
	starred: boolean;
	onToggled: () => Promise<void>;
}) {
	const cwd = useRepoCwd();
	const [busy, setBusy] = useState(false);
	const handleClick = async (event: MouseEvent) => {
		event.stopPropagation();
		if (busy) return;
		setBusy(true);
		try {
			await toggleStar(itemId, !starred, cwd);
			await onToggled();
		} finally {
			setBusy(false);
		}
	};
	return (
		<Tooltip title={starred ? "Unstar" : "Star"}>
			<span>
				<IconButton
					component="span"
					role="button"
					aria-label={starred ? "Unstar" : "Star"}
					aria-pressed={starred}
					color={starred ? "warning" : "default"}
					size="small"
					disabled={busy}
					onClick={handleClick}
				>
					{starred ? <StarIcon /> : <StarBorderIcon />}
				</IconButton>
			</span>
		</Tooltip>
	);
}
