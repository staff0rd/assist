import ListIcon from "@mui/icons-material/List";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Box from "@mui/material/Box";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import { backlogDetail } from "./backlogDetail";
import { PhoneSheetItem } from "./PhoneSheetItem";
import { usePhoneActions } from "./usePhoneActions";

export function PhoneStarGroup({
	session,
	onDone,
}: {
	session: SessionInfo;
	onDone: () => void;
}) {
	const { isStarred, toggleStar } = usePhoneActions();
	const starred = isStarred(session);
	const backlog = backlogDetail(session);
	const StarGlyph = starred ? StarIcon : StarBorderIcon;
	return (
		<Box sx={nodeListSx.group}>
			{backlog && (
				<PhoneSheetItem
					label="Backlog item"
					detail={backlog}
					icon={<ListIcon fontSize="small" />}
				/>
			)}
			<PhoneSheetItem
				label={starred ? "Unstar" : "Star"}
				icon={<StarGlyph fontSize="small" />}
				onClick={() => {
					toggleStar(session);
					onDone();
				}}
			/>
		</Box>
	);
}
