import DOMPurify from "dompurify";

const purify = DOMPurify();

export function sanitize(value: string | null | undefined): string {
  if (!value) return "";
  return purify.sanitize(value, { ALLOWED_TAGS: [] });
}

export function sanitizeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return purify.sanitize(value, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "span", "div", "img", "hr", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "id", "style"],
    ADD_ATTR: ["target"],
  });
}
