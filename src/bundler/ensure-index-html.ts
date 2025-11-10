export interface ExtractedHeadElements {
  elements: HTMLElement[];
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

    const elements = Array.from(head.children) as HTMLElement[];

    return {
      elements,
    };
  } catch (error) {
    return null;
  }
}

export function extractBodyContent(htmlString: string): HTMLElement[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const body = doc.body;

    if (!body) {
      return [];
    }

    return Array.from(body.children) as HTMLElement[];
  } catch (error) {
    return [];
  }
}

function elementsAreEqual(el1: HTMLElement, el2: HTMLElement): boolean {
  // Check tag name
  if (el1.tagName !== el2.tagName) {
    return false;
  }

  // Check attributes
  if (el1.attributes.length !== el2.attributes.length) {
    return false;
  }

  for (let i = 0; i < el1.attributes.length; i++) {
    const attr1 = el1.attributes[i];
    const attr2 = el2.getAttribute(attr1.name);
    if (attr2 !== attr1.value) {
      return false;
    }
  }

  // Check text content
  if (el1.textContent !== el2.textContent) {
    return false;
  }

  return true;
}

function findMatchingElement(
  element: HTMLElement,
  container: HTMLElement
): HTMLElement | null {
  const children = Array.from(container.children) as HTMLElement[];
  return children.find((child) => elementsAreEqual(element, child)) || null;
}

export function ensureIndexHtml(document: Document, htmlContent: string): void {
  // extract head elements
  const extractedHead = extractHeadElements(htmlContent);

  // extract body content
  const bodyContent = extractBodyContent(htmlContent);

  // handle head elements - only add/update if different
  if (extractedHead) {
    for (const element of extractedHead.elements) {
      const existingElement = findMatchingElement(element, document.head);
      if (!existingElement) {
        const clonedElement = element.cloneNode(true) as HTMLElement;
        document.head.appendChild(clonedElement);
      }
    }

    // Remove head elements that are no longer needed
    const currentHeadElements = Array.from(
      document.head.children
    ) as HTMLElement[];
    for (const existingElement of currentHeadElements) {
      const matchInNew = extractedHead.elements.find((newEl) =>
        elementsAreEqual(existingElement, newEl)
      );
      if (!matchInNew) {
        existingElement.remove();
      }
    }
  }

  // handle body content - only add/update if different
  for (const element of bodyContent) {
    const existingElement = findMatchingElement(element, document.body);
    if (!existingElement) {
      const clonedElement = element.cloneNode(true) as HTMLElement;
      document.body.appendChild(clonedElement);
    }
  }

  // Remove body elements that are no longer needed
  const currentBodyElements = Array.from(
    document.body.children
  ) as HTMLElement[];
  for (const existingElement of currentBodyElements) {
    const matchInNew = bodyContent.find((newEl) =>
      elementsAreEqual(existingElement, newEl)
    );
    if (!matchInNew) {
      existingElement.remove();
    }
  }
}
