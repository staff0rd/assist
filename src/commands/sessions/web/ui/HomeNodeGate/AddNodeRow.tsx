import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { nodeListSx } from "./nodeListSx";

export function AddNodeRow({ onAdd }: { onAdd: () => void }) {
	return (
		<ButtonBase sx={nodeListSx.item} onClick={onAdd}>
			<AddIcon sx={{ color: "primary.main" }} />
			<Box component="span" sx={{ color: "primary.main" }}>
				Add node URL
			</Box>
		</ButtonBase>
	);
}
