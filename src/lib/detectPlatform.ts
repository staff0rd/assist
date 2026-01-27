import isWsl from "is-wsl";

type Platform = "wsl" | "windows" | "macos" | "linux" | "unknown";

export function detectPlatform(): Platform {
	if (isWsl) return "wsl";
	switch (process.platform) {
		case "win32":
			return "windows";
		case "darwin":
			return "macos";
		case "linux":
			return "linux";
		default:
			return "unknown";
	}
}
