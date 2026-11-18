import Box from "@mui/material/Box";
import { type Theme, useTheme } from "@mui/material/styles";
import { type ReactNode, useEffect, useState } from "react";

function drawerSx(open: boolean) {
	return (t: Theme) => ({
		flex: `0 0 ${open ? "50%" : "0%"}`,
		minHeight: 0,
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		transition: t.transitions.create("flex-basis", {
			duration: t.transitions.duration.standard,
			easing: t.transitions.easing.easeOut,
		}),
	});
}

export function SessionDrawer({
	shown,
	children,
}: {
	shown: boolean;
	children: ReactNode;
}) {
	const [mounted, setMounted] = useState(shown);
	const [open, setOpen] = useState(false);
	const duration = useTheme().transitions.duration.standard;

	useEffect(() => {
		if (!shown) {
			setOpen(false);
			const timer = setTimeout(() => setMounted(false), duration);
			return () => clearTimeout(timer);
		}
		setMounted(true);
		const frame = requestAnimationFrame(() => setOpen(true));
		return () => cancelAnimationFrame(frame);
	}, [shown, duration]);

	return <Box sx={drawerSx(open)}>{mounted && children}</Box>;
}
