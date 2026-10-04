import { z } from "zod";

export const SSH_LINK_RETIRED =
	"ssh links are no longer supported; relink with `assist sessions nodes link <name> --tailscale <host> --port <port>`";

export const sessionLinkSchema = z.preprocess(
	(link, ctx) => {
		if (link && typeof link === "object" && "ssh" in link)
			ctx.issues.push({
				code: "custom",
				message: SSH_LINK_RETIRED,
				input: link,
			});
		return link;
	},
	z.strictObject({ name: z.string(), url: z.string() }),
);
