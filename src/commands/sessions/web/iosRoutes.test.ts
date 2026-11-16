import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const swiftDir = join(process.cwd(), "ios-app/ios/App/App");
const routeTable = readFileSync(
	join(process.cwd(), "src/commands/sessions/web/handleRequest.ts"),
	"utf8",
);

function iosPaths(): string[] {
	const paths = readdirSync(swiftDir)
		.filter((file) => file.endsWith(".swift"))
		.flatMap((file) =>
			[
				...readFileSync(join(swiftDir, file), "utf8").matchAll(
					/HomeNode\.url\(\s*"(api\/[^"]+)"/g,
				),
			].map((match) => `/${match[1]}`),
		);
	return [...new Set(paths)];
}

function routeKeys(): Set<string> {
	return new Set(
		[
			...routeTable.matchAll(/"(?:GET|POST|PUT|PATCH|DELETE) (\/api\/[^"]+)"/g),
		].map((match) => match[1]),
	);
}

describe("iOS app routes", () => {
	it("finds the paths the iOS app calls", () => {
		expect(iosPaths().length).toBeGreaterThan(0);
	});

	it.each(iosPaths())("%s is in the server route table", (path) => {
		expect(routeKeys()).toContain(path);
	});
});
