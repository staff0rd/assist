import { describe, expect, it } from "vitest";
import {
	isDockerfile,
	isEnvFile,
	isHashCommentFile,
	isShellFile,
} from "./isHashCommentFile";

describe("isHashCommentFile", () => {
	it.each([
		"config.yml",
		"config.yaml",
		"Dockerfile",
		"Dockerfile.prod",
		"service.dockerfile",
		".env",
		".env.local",
		"prod.env",
		"deploy.sh",
		"path/to/setup.sh",
	])("matches %s", (filePath) => {
		expect(isHashCommentFile(filePath)).toBe(true);
	});

	it.each(["src/a.ts", "README.md", "data.json", "Dockerfilexyz", undefined])(
		"does not match %s",
		(filePath) => {
			expect(isHashCommentFile(filePath)).toBe(false);
		},
	);

	it("recognises shell files", () => {
		expect(isShellFile("build.sh")).toBe(true);
		expect(isShellFile("build.ts")).toBe(false);
	});

	it("recognises Dockerfile variants", () => {
		expect(isDockerfile("Dockerfile")).toBe(true);
		expect(isDockerfile("Dockerfile.dev")).toBe(true);
		expect(isDockerfile("web.dockerfile")).toBe(true);
		expect(isDockerfile("dockerfile.md")).toBe(false);
	});

	it("recognises env files", () => {
		expect(isEnvFile(".env")).toBe(true);
		expect(isEnvFile(".env.production")).toBe(true);
		expect(isEnvFile("staging.env")).toBe(true);
		expect(isEnvFile("environment.ts")).toBe(false);
	});
});
