import Box from "@mui/material/Box";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneNavBar } from "./PhoneNavBar";

const goneSx = {
	flex: 1,
	p: 3,
	color: "text.secondary",
	textAlign: "center",
} as const;

export function PhoneSessionGone() {
	return (
		<>
			<PhoneNavBar left={<PhoneBackButton />} title="Session" />
			<Box sx={goneSx}>This session has ended.</Box>
		</>
	);
}
