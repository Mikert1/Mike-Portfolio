/**
 * Load shared page parts (navbar, footer) into elements with a matching ID.
 *
 * The navbar used to live in an <object>, but its dropdowns need to draw
 * outside the 50px bar — an embedded document clips them. Injecting the
 * markup into the page itself keeps the menus (and the #anchor scrolling)
 * in the same document.
 *
 * @param {Object} options
 * @param {string[]} options.components - names to load, e.g. ['navbar', 'footer']
 * @param {string} options.path - base directory, e.g. '/components/'
 */
export async function loadComponents({ components = [], path = '/components/' } = {}) {
    if (!path.endsWith('/')) path += '/';

    for (const name of components) {
        const el = document.getElementById(name);
        if (!el) {
            console.warn(`[loadComponents] No element with ID: ${name}, skipping`);
            continue;
        }

        try {
            const res = await fetch(`${path}${name}.html`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            el.innerHTML = await res.text();
        } catch (err) {
            console.error(`Failed to load component '${name}':`, err);
        }
    }
    // No classium call needed here — it watches the body with a
    // MutationObserver and styles the injected markup on its own.
}
