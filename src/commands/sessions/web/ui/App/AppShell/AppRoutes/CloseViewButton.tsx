import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import type { SxProps, Theme } from "@mui/material/styles";
import { useNavigate } from "react-router";

export function CloseViewButton({
	sx,
	onClose,
}: {
	sx?: SxProps<Theme>;
	onClose?: () => void;
}) {
	const navigate = useNavigate();

	return (
		<IconButton
			size="small"
			onClick={onClose ?? (() => navigate(-1))}
			title="Close"
			sx={[
				{ color: "text.disabled", "&:hover": { color: "text.primary" } },
				...(Array.isArray(sx) ? sx : [sx]),
			]}
		>
			<CloseIcon sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
