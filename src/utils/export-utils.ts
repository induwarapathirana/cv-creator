
/**
 * Collects all CSS from the current document to send to the server.
 * This includes inline styles, linked stylesheets (fetched as text), and injected styles.
 */
export async function getDocumentStyles(): Promise<string> {
    const styleSheets = Array.from(document.styleSheets);
    let css = '';

    for (const sheet of styleSheets) {
        try {
            // Check if it's a local stylesheet or inline style
            if (sheet.href) {
                // Determine if it's a local URL we can fetch
                if (sheet.href.startsWith(window.location.origin)) {
                    const response = await fetch(sheet.href);
                    const text = await response.text();
                    css += text + '\n';
                } else {
                    // Start of external stylesheet logic (fonts etc) - complicated due to CORS
                    // For now, we skip external sheets or hope they are handled by networkidle0 if linked in Head
                }
            } else if (sheet.cssRules) {
                // Inline styles (<style> tags)
                for (const rule of Array.from(sheet.cssRules)) {
                    css += rule.cssText + '\n';
                }
            }
        } catch (e) {
            console.warn('Could not access stylesheet:', sheet.href, e);
        }
    }

    // Fallback: manually grab the content of our main globals.css if we can identify it,
    // or rely on the loop above which should catch it if it's treated as same-origin.

    return css;
}

/**
 * Prepares the Resume HTML wrapper for export.
 * Wraps the raw resume content in a clean container.
 */
export function getResumeHtml(elementId: string): string {
    const element = document.getElementById(elementId);
    if (!element) return '';

    // We want the inner HTML of the resume container
    // We might need to wrap it to match the hierarchy expected by CSS (e.g. .resume-page)
    return element.outerHTML;
}
