import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router";
import { useEdgeSwipeBack } from "./useEdgeSwipeBack";

const backSx = { color: "primary.main" } as const;

export function PhoneBackButton({ label, to }: { label: string; to?: string }) {
	const navigate = useNavigate();
	const goBack = () => (to === undefined ? navigate(-1) : navigate(to));
	useEdgeSwipeBack(goBack);
	return (
		<IconButton aria-label={`Back to ${label}`} sx={backSx} onClick={goBack}>
			<ChevronLeftIcon />
		</IconButton>
	);
}
