import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSheetItem } from "../PhoneActions/PhoneSheetItem";
import { type BacklogItemScope, backlogItemPath } from "./backlogItemPath";

const chevron = <ChevronRightIcon fontSize="small" />;

export function PhoneItemPages({
	item,
	scope,
}: {
	item: BacklogItem;
	scope: BacklogItemScope;
}) {
	const navigate = useNavigate();
	const criteria = item.acceptanceCriteria.length;
	const open = (page: "description" | "criteria") => () =>
		navigate(backlogItemPath(item.id, scope, page));
	return (
		<Box sx={[nodeListSx.group, { mt: 2 }]}>
			<PhoneSheetItem
				label="Acceptance criteria"
				end={
					<>
						{criteria}
						{chevron}
					</>
				}
				onClick={criteria ? open("criteria") : undefined}
			/>
			<PhoneSheetItem
				label="Description"
				end={chevron}
				onClick={item.description ? open("description") : undefined}
			/>
		</Box>
	);
}
