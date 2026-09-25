import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export function useReleasesRedirect(configured: boolean | undefined): void {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const onReleases =
		pathname === "/releases" || pathname.startsWith("/releases/");

	useEffect(() => {
		if (configured === false && onReleases)
			navigate("/sessions", { replace: true });
	}, [configured, onReleases, navigate]);
}
