import type { ComponentProps } from "react";
import { useLocation } from "react-router";
import { ErrorBoundary } from "../App/AppShell/AppRoutes/AppLayout/ErrorBoundary";
import { PhoneRoutes } from "./PhoneRoutes";

export function GuardedPhoneRoutes(props: ComponentProps<typeof PhoneRoutes>) {
	const { pathname } = useLocation();
	return (
		<ErrorBoundary key={pathname}>
			<PhoneRoutes {...props} />
		</ErrorBoundary>
	);
}
