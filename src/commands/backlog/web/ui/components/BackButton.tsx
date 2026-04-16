import { Button } from "@mui/material";
import { useNavigate } from "react-router";

type BackButtonProps = {
	to: string;
};

export function BackButton({ to }: BackButtonProps) {
	const navigate = useNavigate();
	return (
		<Button
			variant="text"
			size="small"
			onClick={() => navigate(to)}
			sx={{ mb: 2, textTransform: "none" }}
		>
			&larr; Back
		</Button>
	);
}
