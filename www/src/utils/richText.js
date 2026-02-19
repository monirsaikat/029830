/**
 * @param {string | null | undefined} html
 */
export function toPlainText(html) {
  if (!html) return "";

  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string | null | undefined} html
 */
export function hasRichTextContent(html) {
  return toPlainText(html).length > 0;
}
