import HubIcon from "@mui/icons-material/Hub";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { NavigateMenuItem } from "./NavigateMenuItem";

export function navigationMenuItems(onNavigate: () => void) {
	return [
		<NavigateMenuItem
			key="nodes"
			icon={<HubIcon fontSize="small" />}
			label="Nodes"
			to="/nodes"
			onClose={onNavigate}
		/>,
		<NavigateMenuItem
			key="connect-mobile"
			icon={<PhoneIphoneIcon fontSize="small" />}
			label="Connect mobile"
			to="/connect-mobile"
			onClose={onNavigate}
		/>,
	];
}
