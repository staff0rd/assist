import { detectPlatform } from "../../../lib/detectPlatform";
import { windowsCwdToWslPath } from "./windowsCwdToWslPath";

export function toGitCwd(cwd: string): string {
	return detectPlatform() === "wsl" ? windowsCwdToWslPath(cwd) : cwd;
}
