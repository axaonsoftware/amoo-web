import DOMPurify from "dompurify";

// DOMPurify needs a real DOM. During Next.js prerendering these modules run in
// Node, where `DOMPurify()` returns a stub with `isSupported === false` and no
// `sanitize` method — so resolve the instance lazily and guard every call.
let purify: ReturnType<typeof DOMPurify> | null = null;

function getPurify() {
  if (purify) return purify;
  if (typeof window === "undefined") return null;
  const instance = DOMPurify(window);
  if (!instance.isSupported) return null;
  purify = instance;
  return purify;
}

// Server-side fallback for the strip-everything case. The result is always
// rendered as a JSX text node, which React escapes on its own, so removing the
// markup is all that's needed here.
function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

export function sanitize(value: string | null | undefined): string {
  if (!value) return "";
  const p = getPurify();
  if (!p) return stripTags(value);
  return p.sanitize(value, { ALLOWED_TAGS: [] });
}

export function sanitizeHtml(value: string | null | undefined): string {
  if (!value) return "";
  const p = getPurify();
  if (!p) return stripTags(value);
  // Enforce rel="noopener noreferrer" on links with target="_blank" to prevent
  // reverse tabnabbing. DOMPurify's ADD_ATTR only whitelists attributes but
  // does not auto-set values, so we use a hook.
  p.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  const result = p.sanitize(value, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "span", "div", "img", "hr", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "id"],
    ADD_ATTR: ["target"],
  });
  return result;
}
