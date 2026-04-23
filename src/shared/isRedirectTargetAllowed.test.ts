import { describe, expect, it } from "vitest";
import { isRedirectTargetAllowed } from "./isRedirectTargetAllowed";

describe("isRedirectTargetAllowed", () => {
	describe("with a Unix-style temp directory", () => {
		const unixTmp = "/tmp";

		it("allows an exact-match tmpdir", () => {
			expect(isRedirectTargetAllowed("/tmp", unixTmp)).toBe(true);
		});

		it("allows a file directly in tmpdir", () => {
			expect(isRedirectTargetAllowed("/tmp/foo.log", unixTmp)).toBe(true);
		});

		it("allows a nested path in tmpdir", () => {
			expect(isRedirectTargetAllowed("/tmp/a/b/c.json", unixTmp)).toBe(true);
		});

		it("rejects a path that only shares a prefix", () => {
			expect(isRedirectTargetAllowed("/tmpfoo/bar", unixTmp)).toBe(false);
		});

		it("rejects a relative path", () => {
			expect(isRedirectTargetAllowed("foo.txt", unixTmp)).toBe(false);
		});

		it("rejects an unrelated absolute path", () => {
			expect(isRedirectTargetAllowed("/etc/passwd", unixTmp)).toBe(false);
		});

		it("handles a tmpdir with a trailing slash", () => {
			expect(isRedirectTargetAllowed("/tmp/foo.log", "/tmp/")).toBe(true);
		});

		it("handles a nested tmpdir path like macOS /var/folders", () => {
			const macTmp = "/var/folders/xx/T";
			expect(isRedirectTargetAllowed("/var/folders/xx/T/out.log", macTmp)).toBe(
				true,
			);
			expect(isRedirectTargetAllowed("/var/folders/yy/other.log", macTmp)).toBe(
				false,
			);
		});
	});

	describe("with a Windows-style temp directory", () => {
		const winTmp = "C:\\Users\\User\\AppData\\Local\\Temp";

		it("allows a file directly in %TEMP%", () => {
			expect(
				isRedirectTargetAllowed(
					"C:\\Users\\User\\AppData\\Local\\Temp\\out.txt",
					winTmp,
				),
			).toBe(true);
		});

		it("is case-insensitive", () => {
			expect(
				isRedirectTargetAllowed(
					"c:\\users\\user\\appdata\\local\\temp\\out.txt",
					winTmp,
				),
			).toBe(true);
		});

		it("accepts forward slashes as path separators", () => {
			expect(
				isRedirectTargetAllowed(
					"C:/Users/User/AppData/Local/Temp/out.txt",
					winTmp,
				),
			).toBe(true);
		});

		it("rejects a Windows path outside %TEMP%", () => {
			expect(
				isRedirectTargetAllowed("C:\\Users\\User\\Documents\\out.txt", winTmp),
			).toBe(false);
		});

		it("rejects a path without a drive letter", () => {
			expect(
				isRedirectTargetAllowed(
					"\\Users\\User\\AppData\\Local\\Temp\\f",
					winTmp,
				),
			).toBe(false);
		});

		it("rejects a path on a different drive", () => {
			expect(
				isRedirectTargetAllowed(
					"D:\\Users\\User\\AppData\\Local\\Temp\\out.txt",
					winTmp,
				),
			).toBe(false);
		});
	});
});
