const IPV4 = /^\d+(\.\d+){3}$/;

export function defaultNodeName(url: string): string {
	try {
		const { hostname } = new URL(url);
		return IPV4.test(hostname) ? hostname : hostname.split(".")[0];
	} catch {
		return "";
	}
}
