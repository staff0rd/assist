import CheckIcon from "@mui/icons-material/Check";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import { NodeDot, type NodeDotTone } from "../../HomeNodeGate/NodeDot";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";

type Props = {
	name: string;
	detail: string;
	tone: NodeDotTone;
	selected: boolean;
	onChoose: () => void;
	onEdit: () => void;
};

export function SavedNodeRow({
	name,
	detail,
	tone,
	selected,
	onChoose,
	onEdit,
}: Props) {
	return (
		<Box sx={{ display: "flex", alignItems: "stretch" }}>
			<ButtonBase
				sx={nodeListSx.item}
				onClick={onChoose}
				aria-current={selected}
			>
				<NodeDot tone={tone} />
				<Box component="span" sx={nodeListSx.grow}>
					{name}
					<Box component="span" sx={nodeListSx.detail}>
						{detail}
					</Box>
				</Box>
				{selected && <CheckIcon sx={{ color: "primary.main" }} />}
			</ButtonBase>
			<IconButton
				aria-label={`Edit ${name}`}
				onClick={onEdit}
				sx={{ color: "text.secondary", borderRadius: 0 }}
			>
				<EditOutlinedIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
