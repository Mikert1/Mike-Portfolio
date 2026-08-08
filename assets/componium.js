/**
 * Load shared page parts (navbar, footer) from components/ and put them into
 * the page in place of a matching placeholder element.
 *
 * They live in one file each rather than being copied into every page, so the
 * navbar is edited once. They can't sit in an <object> like the old ones did:
 * the menus draw outside the 50px bar, and an embedded document clips them.
 *
 * @param {Object} options
 * @param {string[]} options.components - names to load, e.g. ['navbar', 'footer']
 * @param {string} [options.path] - where the .html files live. Defaults to
 *   ../components/ resolved against THIS file, which is what you want.
 */
export async function loadComponents({ components = [], path } = {}) {
    // Resolved against componium.js's own URL, not the page's. An absolute
    // '/components/' only works when the site is served from the root of its
    // host — under a sub-path (a local server rooted a folder up, a project
    // page, opening a subfolder directly) it silently points somewhere else,
    // and you get a 404 or, worse, a different folder's components. Anchoring
    // to this file means it lands next to the code that asked for it.
    const base = new URL(path ?? '../components/', import.meta.url);
    if (!base.pathname.endsWith('/')) base.pathname += '/';

    for (const name of components) {
        const el = document.getElementById(name);
        if (!el) {
            console.warn(`[componium] No placeholder with id="${name}" on this page, skipping.`);
            continue;
        }

        const url = new URL(`${name}.html`, base);
        try {
            // no-cache revalidates rather than trusting a stored copy. These
            // are fetched, not linked, so nothing else prompts the browser to
            // recheck them and an edit can go unnoticed. Unchanged files still
            // cost only a 304.
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

            const html = await res.text();
            if (!html.trim()) throw new Error('file is empty');

            // A component file is a whole little document, and what gets used
            // is its <body>. The wrapper isn't decoration: dev servers that
            // inject a live-reload script hunt for </body>, and given a bare
            // fragment some of them mangle or cut the response short — which
            // shows up as a component that renders with its tail missing.
            //
            // Catching that here beats rendering half a navbar: if the file
            // claims a body but the closing tag never arrived, the response
            // was truncated in transit, so say so rather than paper over it.
            // Comments are stripped before the check: a component that talks
            // about body tags in a comment would otherwise satisfy it on the
            // strength of that prose alone, even when cut off mid-file.
            const markup = html.replace(/<!--[\s\S]*?-->/g, '');
            const looksLikeDocument = /<body[\s>]/i.test(markup);
            if (looksLikeDocument && !/<\/body\s*>/i.test(markup)) {
                throw new Error(
                    `response was cut short (${html.length} bytes, no closing </body>) — ` +
                    `the server likely truncated it`
                );
            }

            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Replacing the placeholder rather than filling it means the live
            // DOM ends up exactly like the component file, with no leftover
            // wrapper between the page and the markup. Note that <script>
            // tags inside a component will NOT run — parsed scripts are inert.
            el.replaceWith(...doc.body.childNodes);
        } catch (err) {
            // Loud on purpose. A component that silently fails to load leaves
            // a page that looks merely "wrong" rather than broken, which is
            // hard to tell apart from a styling bug.
            console.error(`[componium] Could not load '${name}' from ${url.href}:`, err);
        }
    }
    // No classium call needed here — it watches the body with a
    // MutationObserver and styles the injected markup on its own.
}
