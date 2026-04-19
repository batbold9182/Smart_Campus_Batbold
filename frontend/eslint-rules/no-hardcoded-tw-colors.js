/**
 * ESLint rule: no-hardcoded-tw-colors
 *
 * Warns when className / textClassName JSX props contain raw Tailwind color
 * utilities (e.g. bg-blue-500, bg-red-600) instead of design-token aliases
 * (e.g. bg-app-primary, bg-app-danger) from styles/tokens.js.
 *
 * Checked attribute names: className, textClassName
 * Checked string forms: literals, template-literal quasis, ternary branches
 */

// Matches bg-/border- + any Tailwind color name + shade number.
// Intentionally excludes text-* (text-white is valid on coloured buttons).
const COLOR_RE =
  /\b(?:bg|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g;

// Tokens that are intentional — skip these if they somehow match the pattern.
const ALLOWED_PREFIXES = ["app-", "dark-"];

function extractMatches(str) {
  if (typeof str !== "string") return [];
  const hits = [];
  let m;
  COLOR_RE.lastIndex = 0;
  while ((m = COLOR_RE.exec(str)) !== null) {
    const cls = m[0];
    // e.g. "bg-app-primary" won't match the regex, but guard anyway
    if (!ALLOWED_PREFIXES.some((p) => cls.includes(p))) {
      hits.push(cls);
    }
  }
  return hits;
}

function reportMatches(context, node, str) {
  extractMatches(str).forEach((match) => {
    context.report({
      node,
      messageId: "hardcodedColor",
      data: { match },
    });
  });
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer design-token Tailwind classes (bg-app-primary, bg-app-danger, …) " +
        "over raw color utilities (bg-blue-500, bg-red-600, …).",
    },
    messages: {
      hardcodedColor:
        "Hardcoded Tailwind color '{{match}}'. " +
        "Use a token alias instead (see styles/tokens.js).",
    },
    schema: [],
  },

  create(context) {
    const PROP_NAMES = new Set(["className", "textClassName"]);

    return {
      JSXAttribute(node) {
        if (!PROP_NAMES.has(node.name?.name)) return;
        if (!node.value) return;

        const val = node.value;

        // className="..."
        if (val.type === "Literal") {
          reportMatches(context, val, val.value);
          return;
        }

        if (val.type !== "JSXExpressionContainer") return;
        const expr = val.expression;

        // className={`...${cond}...`}
        if (expr.type === "TemplateLiteral") {
          expr.quasis.forEach((q) =>
            reportMatches(context, q, q.value.cooked ?? q.value.raw)
          );
          return;
        }

        // className={cond ? "..." : "..."}
        if (expr.type === "ConditionalExpression") {
          [expr.consequent, expr.alternate].forEach((branch) => {
            if (branch.type === "Literal") reportMatches(context, branch, branch.value);
          });
          return;
        }

        // className={`... ${cond ? "a" : "b"} ...`} — template + ternary
        if (expr.type === "TemplateLiteral") {
          expr.expressions.forEach((e) => {
            if (e.type === "ConditionalExpression") {
              [e.consequent, e.alternate].forEach((branch) => {
                if (branch.type === "Literal") reportMatches(context, branch, branch.value);
              });
            }
          });
        }
      },
    };
  },
};
