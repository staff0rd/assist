import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router";

const backSx = { color: "primary.main" } as const;

export function PhoneBackButton({ label, to }: { label: string; to?: string }) {
	const navigate = useNavigate();
	return (
		<IconButton
			aria-label={`Back to ${label}`}
			sx={backSx}
			onClick={() => (to === undefined ? navigate(-1) : navigate(to))}
		>
			<ChevronLeftIcon />
		</IconButton>
	);
}
