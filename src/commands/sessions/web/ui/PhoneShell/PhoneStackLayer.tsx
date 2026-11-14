import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { ErrorBoundary } from "../App/AppShell/AppRoutes/AppLayout/ErrorBoundary";
import type { NavStackLayer } from "./PhoneNavStack/navStackLayers";
import { phonePageLabel } from "./PhoneNavStack/phonePageLabel";
import { PhoneStackPageContext } from "./PhoneNavStack/usePhoneStackPage";
import { PhoneRoutes, type PhoneRoutesProps } from "./PhoneRoutes";
import type { PhoneTabRestore } from "./PhoneTabBar/usePhoneTabMemory";

const pageSx = {
	position: "absolute",
	inset: 0,
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
	bgcolor: "background.default",
} as const;

type Props = NavStackLayer & {
	pageRef: (el: HTMLElement | null) => void;
	routes: PhoneRoutesProps;
	restore: PhoneTabRestore;
};

export function PhoneStackLayer({
	location,
	below,
	isCurrent,
	isMoving,
	shown,
	pageRef,
	routes,
	restore,
}: Props) {
	const { tokens } = useTheme();
	return (
		<Box
			ref={pageRef}
			sx={pageSx}
			style={{
				zIndex: isMoving ? 3 : 1,
				visibility: shown ? undefined : "hidden",
				boxShadow: isMoving ? tokens.elevation.pushEdge : undefined,
			}}
			inert={!isCurrent}
		>
			<PhoneStackPageContext.Provider
				value={{
					isCurrent,
					beneath: below,
					beneathLabel: below && phonePageLabel(below, routes.socket),
				}}
			>
				<ErrorBoundary>
					<PhoneRoutes {...routes} location={location} restore={restore} />
				</ErrorBoundary>
			</PhoneStackPageContext.Provider>
		</Box>
	);
}
