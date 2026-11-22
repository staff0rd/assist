import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export function useUnconfiguredRedirect(
	configured: boolean | undefined,
	section: string,
): void {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const onSection = pathname === section || pathname.startsWith(`${section}/`);

	useEffect(() => {
		if (configured === false && onSection)
			navigate("/sessions", { replace: true });
	}, [configured, onSection, navigate]);
}
