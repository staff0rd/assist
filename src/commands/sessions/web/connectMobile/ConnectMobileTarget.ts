export type ConnectMobileTarget =
	| { ok: true; url: string; name: string }
	| { ok: false; reason: string; remediation: string };
