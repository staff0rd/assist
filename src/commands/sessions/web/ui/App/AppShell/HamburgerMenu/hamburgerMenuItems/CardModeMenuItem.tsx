import ViewAgendaOutlined from "@mui/icons-material/ViewAgendaOutlined";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { useCardModeContext } from "../../../useCardModeContext";

export function CardModeMenuItem() {
	const { cardMode, setCardMode } = useCardModeContext();

	return (
		<MenuItem
			role="menuitemcheckbox"
			aria-checked={cardMode}
			onClick={() => setCardMode(!cardMode)}
		>
			<ListItemIcon>
				<ViewAgendaOutlined fontSize="small" />
			</ListItemIcon>
			<ListItemText>Card mode</ListItemText>
			<Switch
				size="small"
				edge="end"
				checked={cardMode}
				tabIndex={-1}
				slotProps={{ input: { "aria-hidden": true } }}
			/>
		</MenuItem>
	);
}
