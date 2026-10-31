import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ButtonBase from "@mui/material/ButtonBase";
import { useNavigate } from "react-router";
import { touchTarget } from "../designSystem/touchTarget";

const backSx = {
	minHeight: touchTarget,
	px: 0.5,
	gap: 0.25,
	color: "primary.main",
	fontSize: 16,
	borderRadius: 1,
} as const;

export function PhoneBackButton({ label, to }: { label: string; to?: string }) {
	const navigate = useNavigate();
	return (
		<ButtonBase
			sx={backSx}
			onClick={() => (to === undefined ? navigate(-1) : navigate(to))}
		>
			<ChevronLeftIcon />
			{label}
		</ButtonBase>
	);
}
