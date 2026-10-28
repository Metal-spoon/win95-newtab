// Collapses newline+indentation so multiline templates render without extra text nodes
export const html = (strings, ...values) =>
  String.raw({ raw: strings.map((s) => s.replace(/\n\s*/g, '')) }, ...values)
