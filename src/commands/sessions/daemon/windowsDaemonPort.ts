import { loadConfig } from "../../../shared/loadConfig";

const DEFAULT_PORT = 51764;
// Under WSL2 mirrored networking the Windows host is reachable on loopback;
// NAT-mode users override sessions.windowsDaemonHost with the host IP.
const DEFAULT_HOST = "127.0.0.1";

export function windowsDaemonPort(): number {
	return loadConfig().sessions?.windowsDaemonPort ?? DEFAULT_PORT;
}

export function windowsDaemonHost(): string {
	return loadConfig().sessions?.windowsDaemonHost ?? DEFAULT_HOST;
}
