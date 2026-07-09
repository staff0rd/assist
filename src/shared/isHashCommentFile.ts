import path from "node:path";
import { isYamlFile } from "./isYamlFile";

export function isShellFile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	return filePath.endsWith(".sh");
}

export function isDockerfile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	const base = path.basename(filePath);
	return (
		base === "Dockerfile" ||
		base.startsWith("Dockerfile.") ||
		base.endsWith(".dockerfile")
	);
}

export function isEnvFile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	const base = path.basename(filePath);
	return base === ".env" || base.endsWith(".env") || base.startsWith(".env.");
}

export function isHashCommentFile(filePath: string | undefined): boolean {
	return (
		isYamlFile(filePath) ||
		isDockerfile(filePath) ||
		isEnvFile(filePath) ||
		isShellFile(filePath)
	);
}
