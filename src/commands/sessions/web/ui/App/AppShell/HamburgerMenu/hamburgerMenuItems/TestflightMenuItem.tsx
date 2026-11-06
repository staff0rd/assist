import FlightIcon from "@mui/icons-material/Flight";
import { IconMenuItem } from "./IconMenuItem";

export function TestflightMenuItem({ onClick }: { onClick: () => void }) {
	return (
		<IconMenuItem
			icon={<FlightIcon fontSize="small" />}
			label="TestFlight testers"
			onClick={onClick}
		/>
	);
}
