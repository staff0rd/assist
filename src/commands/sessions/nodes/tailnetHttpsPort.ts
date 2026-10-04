import { detectPlatform } from "../../../lib/detectPlatform";

const MIRRORED_WSL_OWNS_PORT_OFFSET = 1000;

export function tailnetHttpsPort(port: number): number {
	return detectPlatform() === "wsl"
		? port + MIRRORED_WSL_OWNS_PORT_OFFSET
		: port;
}
