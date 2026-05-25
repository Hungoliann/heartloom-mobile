module.exports = function () {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.type !== "Import") return;
        const arg = path.node.arguments[0];
        if (!arg) return;
        // Match: import(OTEL_PKG) or import("@opentelemetry/api")
        const isOtelVar = arg.type === "Identifier" && arg.name === "OTEL_PKG";
        const isOtelStr =
          arg.type === "StringLiteral" &&
          arg.value.startsWith("@opentelemetry/");
        if (isOtelVar || isOtelStr) {
          path.replaceWithSourceString("Promise.resolve(null)");
        }
      },
    },
  };
};
