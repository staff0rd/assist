import Box from "@mui/material/Box";
import { Outlet } from "react-router";
import { ScrollRestorationContext } from "../../../../useScrollRestorationContext";
import { ErrorBoundary } from "./ErrorBoundary";
import { useScrollRestoration } from "./useScrollRestoration";

const paneSx = {
	flex: 1,
	minWidth: 0,
	height: "100%",
	display: "flex",
	flexDirection: "column",
	overflow: "auto",
} as const;

export function LayoutContentPane({ pathname }: { pathname: string }) {
	const { containerRef, restoration } = useScrollRestoration(pathname);
	return (
		<Box ref={containerRef} sx={paneSx}>
			<ScrollRestorationContext.Provider value={restoration}>
				<ErrorBoundary key={pathname}>
					<Outlet />
				</ErrorBoundary>
			</ScrollRestorationContext.Provider>
		</Box>
	);
}
