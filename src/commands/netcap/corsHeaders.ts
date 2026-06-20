// Permissive CORS so the cross-origin extension fetch succeeds without any page
// configuration; the receiver is local-only so wildcard origin is acceptable.
export const corsHeaders: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Max-Age": "86400",
};
