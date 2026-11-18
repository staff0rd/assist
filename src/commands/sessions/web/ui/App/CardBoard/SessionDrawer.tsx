import Box from "@mui/material/Box";
import { type Theme, useTheme } from "@mui/material/styles";
import { type ReactNode, useEffect, useState } from "react";

function drawerSx(basis: string) {
	return (t: Theme) => ({
		flex: `0 0 ${basis}`,
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
	full,
	children,
}: {
	shown: boolean;
	full: boolean;
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

	const basis = !open ? "0%" : full ? "100%" : "50%";
	return <Box sx={drawerSx(basis)}>{mounted && children}</Box>;
}
