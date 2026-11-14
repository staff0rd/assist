import HubIcon from "@mui/icons-material/Hub";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import RuleIcon from "@mui/icons-material/Rule";
import { NavigateMenuItem } from "./NavigateMenuItem";

export function navigationMenuItems(onNavigate: () => void) {
	return [
		<NavigateMenuItem
			key="rules"
			icon={<RuleIcon fontSize="small" />}
			label="Rules"
			to="/rules"
			onClose={onNavigate}
		/>,
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
