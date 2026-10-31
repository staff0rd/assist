import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListIcon from "@mui/icons-material/List";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import { backlogDetail } from "./backlogDetail";
import { sessionItemPath } from "./sessionItemPath";
import { PhoneSheetItem } from "./PhoneSheetItem";
import { usePhoneActions } from "./usePhoneActions";

export function PhoneStarGroup({
	session,
	localNode,
	onDone,
}: {
	session: SessionInfo;
	localNode: string | undefined;
	onDone: () => void;
}) {
	const { isStarred, toggleStar } = usePhoneActions();
	const navigate = useNavigate();
	const starred = isStarred(session);
	const backlog = backlogDetail(session);
	const itemPath = sessionItemPath(session, localNode);
	const StarGlyph = starred ? StarIcon : StarBorderIcon;
	return (
		<Box sx={nodeListSx.group}>
			{backlog && (
				<PhoneSheetItem
					label="Backlog item"
					detail={backlog}
					icon={<ListIcon fontSize="small" />}
					end={<ChevronRightIcon fontSize="small" />}
					onClick={
						itemPath
							? () => {
									onDone();
									navigate(itemPath);
								}
							: undefined
					}
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
