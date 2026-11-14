import {
	existsSync,
	mkdirSync,
	renameSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { swapBuildDir } from "./swapBuildDir";

let root: string;
const staging = () => join(root, "dist.next");
const target = () => join(root, "dist");

function write(dir: string, files: Record<string, string>): void {
	for (const [file, text] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, file)), { recursive: true });
		writeFileSync(join(dir, file), text);
	}
}

const read = (file: string) => readFileSync(join(target(), file), "utf8");
const has = (file: string) => existsSync(join(target(), file));

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), "swap-build-"));
});

afterEach(() => {
	rmSync(root, { recursive: true, force: true });
});

describe("swapBuildDir", () => {
	it("moves a first build into a missing dist and removes the staging dir", () => {
		write(staging(), { "index.js": "v1", "web/bundle.js": "b1" });

		swapBuildDir(staging(), target());

		expect(read("index.js")).toBe("v1");
		expect(read("web/bundle.js")).toBe("b1");
		expect(existsSync(staging())).toBe(false);
	});

	it("renames the entry point last so its chunks land first", () => {
		write(staging(), { "index.js": "v1", "chunk-A.js": "a", "z/x.js": "x" });

		const renames: string[] = [];

		swapBuildDir(staging(), target(), "index.js", (from, to) => {
			renames.push(to);
			renameSync(from, to);
		});

		expect(renames.at(-2)).toBe(join(target(), "index.js"));
		expect(renames.at(-1)).toBe(join(target(), ".build-files"));
	});

	it("replaces files in place without ever removing dist", () => {
		write(staging(), { "index.js": "v1", "chunk-A.js": "a" });
		swapBuildDir(staging(), target());
		write(staging(), { "index.js": "v2", "chunk-B.js": "b" });

		swapBuildDir(staging(), target());

		expect(read("index.js")).toBe("v2");
		expect(read("chunk-B.js")).toBe("b");
	});

	it("keeps the previous build's chunks until the build after next", () => {
		write(staging(), { "index.js": "v1", "chunk-A.js": "a" });
		swapBuildDir(staging(), target());
		write(staging(), { "index.js": "v2", "chunk-B.js": "b" });
		swapBuildDir(staging(), target());

		expect(has("chunk-A.js")).toBe(true);

		write(staging(), { "index.js": "v3", "chunk-C.js": "c" });
		swapBuildDir(staging(), target());

		expect(has("chunk-A.js")).toBe(false);
		expect(has("chunk-B.js")).toBe(true);
		expect(has("chunk-C.js")).toBe(true);
	});

	it("treats a dist without a manifest as the previous build", () => {
		write(target(), { "index.js": "old", "chunk-old.js": "o" });
		write(staging(), { "index.js": "v1", "chunk-A.js": "a" });

		swapBuildDir(staging(), target());

		expect(has("chunk-old.js")).toBe(true);
		expect(read("index.js")).toBe("v1");
	});
});
