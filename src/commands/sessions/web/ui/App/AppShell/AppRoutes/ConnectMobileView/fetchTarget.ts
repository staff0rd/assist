import type { ConnectMobileTarget } from "../../../../../connectMobile/ConnectMobileTarget";
import { apiFetch } from "../../../../apiFetch";

export async function fetchTarget(): Promise<ConnectMobileTarget> {
	const res = await apiFetch("/api/connect-mobile");
	if (!res.ok)
		return {
			ok: false,
			reason: `The web server answered ${res.status}`,
			remediation: "Restart the web server and reload this page",
		};
	return res.json();
}
