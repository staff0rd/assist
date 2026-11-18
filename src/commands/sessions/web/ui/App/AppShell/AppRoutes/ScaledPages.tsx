import { Outlet } from "react-router";
import { SessionTextSizeTheme } from "../../SessionTextSizeTheme";

export function ScaledPages() {
	return (
		<SessionTextSizeTheme>
			<Outlet />
		</SessionTextSizeTheme>
	);
}
