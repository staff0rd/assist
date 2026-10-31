import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router";

export function ConnectMobileMenuItem({ onClose }: { onClose: () => void }) {
	const navigate = useNavigate();
	return (
		<MenuItem
			onClick={() => {
				onClose();
				navigate("/connect-mobile");
			}}
		>
			<ListItemIcon>
				<PhoneIphoneIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText>Connect mobile</ListItemText>
		</MenuItem>
	);
}
