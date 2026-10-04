import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isStagedAttachmentPath } from "./isStagedAttachmentPath";
import { stagedAttachmentsDir } from "./stagedAttachmentsDir";

describe("isStagedAttachmentPath", () => {
	it("accepts a file inside the staging dir", () => {
		expect(
			isStagedAttachmentPath(join(stagedAttachmentsDir, "upload-a", "a.png")),
		).toBe(true);
	});

	it("rejects the staging dir itself", () => {
		expect(isStagedAttachmentPath(stagedAttachmentsDir)).toBe(false);
	});

	it("rejects a path that escapes the staging dir", () => {
		expect(
			isStagedAttachmentPath(join(stagedAttachmentsDir, "..", "secret.png")),
		).toBe(false);
		expect(isStagedAttachmentPath("/etc/passwd")).toBe(false);
	});
});
