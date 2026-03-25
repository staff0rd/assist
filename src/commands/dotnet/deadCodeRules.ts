export const deadCodeRules = new Set([
	// JetBrains ReSharper rules
	"UnusedMember.Local",
	"UnusedType.Local",
	"UnusedParameter.Global",
	"UnusedParameter.Local",
	"NotAccessedField.Global",
	"NotAccessedField.Local",
	"NotAccessedVariable.Local",
	"UnusedAutoPropertyAccessor.Global",
	"UnusedAutoPropertyAccessor.Local",
	"ClassNeverInstantiated.Global",
	"ClassNeverInstantiated.Local",
	"UnusedMethodReturnValue.Global",
	"UnusedMethodReturnValue.Local",
	"UnusedVariable.Compiler",
	"RedundantUsingDirective",
	// Roslyn compiler diagnostics
	"CS0168", // Variable declared but never used
	"CS0169", // Field is never used
	"CS0219", // Variable assigned but never used
	"CS0414", // Field assigned but never read
	"CS8321", // Local function declared but never used
	// Roslyn IDE analyzers
	"IDE0051", // Private member is unused
	"IDE0052", // Private member can be removed (value never read)
	"IDE0059", // Unnecessary assignment
	"IDE0060", // Remove unused parameter
]);
