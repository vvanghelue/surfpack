export interface ExtractedHeadElements {
  scripts: Array<{
    src?: string;
    type?: string;
    content?: string;
  }>;
  links: Array<{
    href?: string;
    rel?: string;
    type?: string;
  }>;
}

export function extractHeadElements(
  htmlString: string
): ExtractedHeadElements | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const head = doc.head;

    if (!head) {
      return null;
    }

    const scripts = Array.from(head.querySelectorAll("script")).map(
      (script) => ({
        src: script.src || undefined,
        type: script.type || undefined,
        content: script.textContent || undefined,
      })
    );

    const links = Array.from(head.querySelectorAll("link")).map((link) => ({
      href: link.href || undefined,
      rel: link.rel || undefined,
      type: link.type || undefined,
    }));

    return {
      scripts,
      links,
    };
  } catch (error) {
    return null;
  }
}
