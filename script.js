/* The service worker is gone: it cached the site's own files and answered from
   that cache before the network, so edits kept not showing up. A reload now
   always gets the real file.
   This clears one out of any browser that installed it before — without it an
   old worker keeps intercepting requests on its own. Safe to delete once no
   browser you care about has visited the old version. */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(registrations => registrations.forEach(r => r.unregister()))
        .catch(() => {});
}
if ('caches' in window) {
    caches.keys()
        .then(names => names.forEach(name => caches.delete(name)))
        .catch(() => {});
}

/* Hero parallax, plus the navbar that rides in behind it.

   Every element in the hero carrying data-depth gets shifted down by
   scroll * depth: at depth 1 that cancels the scroll exactly and the layer
   looks pinned, at 0 it travels with the page, below 0 it outruns the page
   and reads as being close to the camera.

   data-dolly is the camera pulling back rather than panning. A layer starts
   that much bigger than it belongs and settles to its true size as you scroll:
   0.14 opens at 1.14 and ends at 1. Apparent size goes as one over distance,
   so the near layer has to shrink far more than the far one for the move to
   read as a camera and not as a zoom — the terrace is a few metres off and
   loses a seventh of itself, the valley is kilometres off and loses almost
   nothing. Giving them the same number would flatten the scene into a poster
   being pulled away from the screen.

   Nothing here knows what the layers are, so swapping the placeholder
   drawings for real photos needs no change on this side. */
(function heroParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    /* The bar only exists on the page that has a hero; elsewhere the navbar
       is a normal block and none of this runs. */
    const bar = document.getElementById('navbarBar');

    /* Two thresholds, not one: a single line at the hero's edge would flip
       the bar on and off on every small scroll that crosses it. */
    const SHOW_AT = 0.9;
    const HIDE_AT = 0.78;

    /* Not hero.querySelectorAll: the wall carries on below the hero as an
       element of its own, and it has to be driven by the same number as the
       terrace or the two are not the same wall. It is a layer like any other —
       depth 0 so it does not move against the page, the terrace's dolly so it
       grows with it. */
    const layers = Array.from(document.querySelectorAll('[data-depth]'), element => ({
        element,
        depth: parseFloat(element.dataset.depth) || 0,
        dolly: parseFloat(element.dataset.dolly) || 0,
        animation: null
    }));

    /* Things that fade out as the hero goes rather than moving with it. The
       number is how fast: 1.6 means gone by the time the hero is 1/1.6 of the
       way past. They are listed separately from the layers because they must
       not be given a transform — the scroll cue is already holding itself
       centred with one. */
    const fades = Array.from(hero.querySelectorAll('[data-fade]'), element => ({
        element,
        factor: parseFloat(element.dataset.fade) || 0,
        animation: null
    }));

    /* How much of the hero's height the camera move is spread over. It used to
       be pinned to the overscroll, because the wall carries on below the hero
       and anything still zooming when the join came into view put bricks of two
       different sizes either side of it. The page wall is a layer of this same
       scene now — #pageWall, same dolly, same number — so the join holds at any
       scale and the move is free to take as long as it wants.

       Which is what lets it be a big move. A camera that travels far needs room
       to travel in, and one spread over a tenth of the hero is a jolt rather
       than a dolly. */
    const dollySpan = parseFloat(hero.dataset.dollySpan) || 1;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ------------------------------------------------------------------ */
    /*  The scroll is not ours to follow.                                   */
    /*                                                                      */
    /*  Firefox scrolls on the compositor, off the main thread, so that a   */
    /*  busy page still scrolls. The whole page — hero and layers with it — */
    /*  moves the instant you turn the wheel. A scroll handler then runs on */
    /*  the main thread, at best one frame later, and puts the layers back  */
    /*  where they belong. That is the snap: the scenery rides the scroll   */
    /*  like everything else, then jumps backwards when the handler lands.  */
    /*  No amount of making the handler cheaper removes it, because the lag */
    /*  is not slowness — it is the handler being on the wrong thread.      */
    /*                                                                      */
    /*  A scroll-driven animation is not followed, it is attached: the      */
    /*  timeline is the scroll position itself, and the compositor advances */
    /*  it in the same frame it moves the page. Nothing can arrive late     */
    /*  because nothing has to arrive at all.                               */
    /*                                                                      */
    /*  The keyframes say the same thing the handler used to compute, at    */
    /*  the offsets where it used to change: start zoomed in and settle by  */
    /*  dollySpan, travel with the page by depth until the hero is past.    */
    /* ------------------------------------------------------------------ */
    const canAttach = typeof window.ScrollTimeline === 'function';
    let attached = false;

    function detach() {
        for (const layer of layers) {
            if (layer.animation) { layer.animation.cancel(); layer.animation = null; }
            layer.element.style.transform = '';
        }
        for (const fade of fades) {
            if (fade.animation) { fade.animation.cancel(); fade.animation = null; }
        }
        attached = false;
    }

    function attach() {
        const scroller = document.scrollingElement || document.documentElement;
        const scrollable = scroller.scrollHeight - scroller.clientHeight;
        const height = hero.offsetHeight;
        if (scrollable <= 0 || height <= 0) return false;

        /* Offsets along the whole document's scroll, because that is what the
           timeline measures. The hero's own progress is a slice of it. */
        const panEnd = Math.min(height / scrollable, 1);
        const dollyEnd = Math.min(panEnd * dollySpan, panEnd);

        detach();
        const timeline = new ScrollTimeline({ source: scroller, axis: 'block' });

        for (const layer of layers) {
            const frames = [];
            const at = (offset, travel, scale) => {
                if (frames.length && offset <= frames[frames.length - 1].offset) return;
                frames.push({
                    offset,
                    transform: 'translate3d(0, ' + travel.toFixed(2) + 'px, 0) scale(' +
                               scale.toFixed(4) + ')'
                });
            };
            at(0, 0, 1 + layer.dolly);
            at(dollyEnd, height * dollySpan * layer.depth, 1);
            at(panEnd, height * layer.depth, 1);
            at(1, height * layer.depth, 1);
            if (frames.length < 2) continue;
            layer.animation = layer.element.animate(frames, { timeline, fill: 'both' });
        }

        for (const fade of fades) {
            if (!fade.factor) continue;
            const gone = Math.min(panEnd / fade.factor, 1);
            if (gone <= 0) continue;
            const frames = [{ offset: 0, opacity: 1 }, { offset: gone, opacity: 0 }];
            if (gone < 1) frames.push({ offset: 1, opacity: 0 });
            fade.animation = fade.element.animate(frames, { timeline, fill: 'both' });
        }

        attached = true;
        return true;
    }

    /* ------------------------------------------------------------------ */
    /*  The fallback, for anything without scroll timelines. Same numbers,  */
    /*  arrived at the old way: read the scroll, write the transforms, one  */
    /*  frame behind. It snaps, and there is nothing to be done about that  */
    /*  from here — but a hero that lags is better than a hero that sits    */
    /*  still.                                                              */
    /* ------------------------------------------------------------------ */
    let queued = false;
    let lastOffset = null;
    let barShown = false;

    function render() {
        queued = false;
        const height = hero.offsetHeight;
        /* Clamped: once the hero has scrolled past there is nothing left to
           see, and letting the numbers run on would fling the layers away. */
        const offset = Math.min(window.scrollY, height);
        const progress = height > 0 ? offset / height : 0;

        if (offset !== lastOffset) {
            lastOffset = offset;
            if (!attached) {
                /* Drives the opacity calcs in the stylesheet. When the layers
                   are attached the animations carry the fades themselves and
                   this is left alone — which also spares the page a custom
                   property changing on every frame, and the restyle of
                   everything that inherits it. */
                hero.style.setProperty('--hero-progress', progress.toFixed(4));

                if (!reduced.matches) {
                    /* Linear against the scroll on purpose: an eased camera
                       stops feeling attached to the hand doing the scrolling. */
                    const settled = dollySpan > 0 ? Math.min(progress / dollySpan, 1) : 1;
                    for (const layer of layers) {
                        let transform = 'translate3d(0, ' +
                                        (offset * layer.depth).toFixed(2) + 'px, 0)';
                        if (layer.dolly) {
                            transform += ' scale(' +
                                         (1 + layer.dolly * (1 - settled)).toFixed(4) + ')';
                        }
                        layer.element.style.transform = transform;
                    }
                }
            }
        }

        /* Always, attached or not: a class toggle is not something a timeline
           can do, and one frame late on a bar that fades in is invisible. */
        if (bar) {
            const shown = barShown ? progress > HIDE_AT : progress >= SHOW_AT;
            if (shown !== barShown) {
                barShown = shown;
                bar.classList.toggle('navbarVisible', shown);
            }
        }
    }

    function onScroll() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(render);
    }

    /* The keyframe offsets are fractions of the document's whole scroll, so
       they are only right while the document is the length it was when they
       were worked out. It is not: this page finishes much taller than it
       starts. The project rows are <object>s whose heights are set from JSON
       once it arrives, the hero art is still decoding, and every one of those
       moves the bottom of the page. Built once at startup the offsets are
       stale by the time anyone scrolls — the layers still move, but they
       reach each mark at the wrong moment, which is its own kind of wrong.

       So rebuild whenever the page's length changes, not only on resize. The
       observer catches the late-arriving rows; the rAF coalesces the burst of
       changes they arrive in. */
    let pending = false;
    let lastLength = -1;

    function rebuild() {
        pending = false;
        const scroller = document.scrollingElement || document.documentElement;
        lastLength = scroller.scrollHeight;
        if (canAttach && !reduced.matches) attach(); else detach();
        lastOffset = null;
        render();
    }

    function rebuildSoon() {
        if (pending) return;
        pending = true;
        requestAnimationFrame(rebuild);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', rebuildSoon);
    reduced.addEventListener('change', rebuildSoon);
    window.addEventListener('load', rebuildSoon);

    if (typeof ResizeObserver === 'function') {
        const watcher = new ResizeObserver(() => {
            const scroller = document.scrollingElement || document.documentElement;
            if (scroller.scrollHeight !== lastLength) rebuildSoon();
        });
        watcher.observe(document.body);
    }

    rebuild();
    /* Transitions come on only after that first placement, so opening a
       /#section link — which lands the page mid-scroll — shows the bar
       already in place instead of sliding it in at the visitor. */
    if (bar) requestAnimationFrame(() => bar.classList.add('navbarAnimated'));
})();

async function getProjects() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
}

async function getPrograms() {
    try {
        const response = await fetch('data/programs.json');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
}

async function getLanguages() {
    try {
        const response = await fetch('data/languages.json');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
}

function flipCard(side) {
    const card = document.querySelector('.flipCard');
    if (side === 'front') {
        card.classList.remove('flipped');
        const text = document.getElementById('helpingText');
        text.innerHTML = '';
    } else {
        card.classList.add('flipped');
    }
}

let myOwnProjectsCount = 0;
let schoolProjectsCount = 0;
let programsCount = 0;
let languagesCount = 0;
getPrograms()
    .then(data => {
        programsCount = data.length;
        console.log(`Number of programs: ${programsCount}`);
    })
    .catch(error => {
        console.error('Error fetching:', error);
    });

getLanguages()
    .then(data => {
        languagesCount = data.length;
        console.log(`Number of languages: ${languagesCount}`);
    })
    .catch(error => {
        console.error('Error fetching:', error);
    });

/* How many cards a homepage row actually renders: the projects not archived,
   plus the "show older projects" tile when there is anything archived. Used
   to size the <object> rows, which stack vertically on phones. */
function rowCardCount(data, types) {
    const inRow = data.filter(project => types.includes(project.project));
    const shown = inRow.filter(project => !project.archived).length;
    return shown + (inRow.length > shown ? 1 : 0);
}

getProjects()
    .then(data => {
        myOwnProjectsCount = rowCardCount(data, ['solo']);
        schoolProjectsCount = rowCardCount(data, ['school', 'work']);

        resize()
    })
    .catch(error => {
        console.error('Error fetching:', error);
    });

function resize() {
    if (window.innerWidth <= 500) {
        const num = myOwnProjectsCount * 450 + 10;
        const num2 = schoolProjectsCount * 450 + 10;
        const num3 = programsCount * 100 + 10;
        const num4 = languagesCount * 230 + 10;
        document.getElementById('myOwnProjects').height = num;
        document.getElementById('schoolProjects').height = num2;
        document.getElementById('programs-object').height = num3;
        document.getElementById('languages-object').height = num4;
    } else {
        document.getElementById('myOwnProjects').height = '450px';
        document.getElementById('schoolProjects').height = '450px';
        document.getElementById('programs-object').height = '170px';
        document.getElementById('languages-object').height = '250px';
    }
}

window.addEventListener('resize', () => {
    resize()
});


/* ---------------------------------------------------------------------- */
/*  The storm over the title.                                               */
/*                                                                          */
/*  Three versions of this effect have now been tried, and the difference   */
/*  between them is worth writing down, because the one that looks the      */
/*  heaviest is the cheapest.                                               */
/*                                                                          */
/*  The first asked the browser to invent the shape of the light on every   */
/*  repaint - an SVG filter per layer generating a noise field, eroding a   */
/*  ring out of the glyphs and warping it along the noise. feTurbulence,    */
/*  feDisplacementMap and feMorphology have no GPU form, so Firefox said    */
/*  "filter chain is too complex for WebRender" and dropped the title onto  */
/*  the software rasteriser. It cost the page its scroll.                   */
/*                                                                          */
/*  The second computed the shape once, offline, and shipped three static   */
/*  drawings. That was fast, and it was dead: the same bolts forever.       */
/*                                                                          */
/*  This one computes the shape here, in the page, over and over - and is   */
/*  cheaper still. The trick is in what happens per frame rather than per   */
/*  bolt. Generating a bolt is arithmetic: a few hundred multiplications    */
/*  and a string. It happens a handful of times a second, not sixty. Once   */
/*  built, a bolt never changes again - the flicker is opacity on a layer   */
/*  the compositor already holds, and the decay is a transform. So the      */
/*  per-frame cost is a few texture blends and nothing else, no matter how  */
/*  many bolts there are or how fast they come.                             */
/*                                                                          */
/*  The one thing to be careful of is the main thread, and the budget here  */
/*  is a fraction of a millisecond per strike: build the geometry, build    */
/*  one string, hand it to the parser, start two animations. No layout is   */
/*  read while a strike is being built - everything measured is measured    */
/*  once and cached, because a getBoundingClientRect in the middle of a     */
/*  scroll is the classic way to lose a frame.                              */
/* ---------------------------------------------------------------------- */

(function titleStorm() {
    'use strict';

    const h2 = document.querySelector('.functionTitle');
    const stage = h2 && h2.querySelector('.functionTitleStorm');
    if (!stage) return;

    const wall = document.getElementById('pageWall');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* The falloff, widest and faintest first so the white core lands on top.
       A bright source clips to white at its centre and finds its colour on
       the way out, which is the one thing that stops glowing text looking
       cheap - so the ladder walks white, pale cyan, cyan, azure, deep blue.

       The glow is drawn rather than blurred. Nine concentric strokes is how
       a falloff is faked in vector art, and it costs a fill instead of a
       blur - which matters because a blur is what had to go.

       Widths are in pixels at a 96px heading and scale with the type. */
    const TIERS = [
        [17.00, 0.020, '#0e42d8'],
        [12.50, 0.034, '#0e42d8'],
        [9.000, 0.055, '#2088ff'],
        [6.500, 0.085, '#2088ff'],
        [4.500, 0.135, '#56c8ff'],
        [3.100, 0.215, '#56c8ff'],
        [2.000, 0.340, '#9ae2ff'],
        [1.250, 0.560, '#ddf6ff'],
        [0.750, 1.000, '#ffffff']
    ];
    const WIDEST = TIERS[0][0];

    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = list => list[(Math.random() * list.length) | 0];
    const chance = p => Math.random() < p;

    /* ------------------------------------------------------------------ */
    /*  Geometry                                                           */
    /* ------------------------------------------------------------------ */

    /* Midpoint displacement: take a segment, split it, push the new point
       sideways by a random amount, halve the amount, repeat. Five levels is
       33 points, which is where a line stops looking like a zigzag and
       starts looking like a discharge. */
    function jag(a, b, rough, levels) {
        let pts = [a, b];
        let amp = rough;
        for (let i = 0; i < levels; i++) {
            const out = [pts[0]];
            for (let j = 0; j < pts.length - 1; j++) {
                const p = pts[j], q = pts[j + 1];
                const dx = q.x - p.x, dy = q.y - p.y;
                const len = Math.hypot(dx, dy) || 1;
                const d = rnd(-amp, amp);
                out.push({ x: (p.x + q.x) / 2 - dy / len * d,
                           y: (p.y + q.y) / 2 + dx / len * d });
                out.push(q);
            }
            pts = out;
            amp *= 0.55;
        }
        return pts;
    }

    /* Jag every leg of a route and join them into one polyline. */
    function chain(route, rough, levels) {
        let pts = [];
        for (let i = 0; i < route.length - 1; i++) {
            const leg = jag(route[i], route[i + 1], rough, levels);
            pts = pts.length ? pts.concat(leg.slice(1)) : leg;
        }
        return pts;
    }

    function path(pts) {
        let s = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
        for (let i = 1; i < pts.length; i++) {
            s += ' L' + pts[i].x.toFixed(1) + ',' + pts[i].y.toFixed(1);
        }
        return s;
    }

    /* A short fork off an existing bolt, thinner than its parent. */
    function branch(host, rough) {
        const i = (host.length * rnd(0.15, 0.85)) | 0;
        const from = host[i];
        const len = rough * rnd(1.4, 4.0);
        const ang = rnd(0, Math.PI * 2);
        return jag(from, { x: from.x + Math.cos(ang) * len,
                           y: from.y + Math.sin(ang) * len },
                   rough * 0.6, 4);
    }

    /* ------------------------------------------------------------------ */
    /*  What is where                                                      */
    /*                                                                     */
    /*  Measured once and cached. Everything below works in stage-local     */
    /*  pixels, so a strike can be built without touching layout at all.    */
    /* ------------------------------------------------------------------ */

    let letters = [];       /* the ink box of every non-space character */
    let k = 1;              /* scale: 1 at a 96px heading */
    let band = null;        /* the ink box of the whole line */
    let brick = null;       /* the wall's course height and brick length */

    const canvas = document.createElement('canvas').getContext('2d');

    /* Borrowed by measureWall below, kept rather than rebuilt because it is
       put into the page and taken out again on every re-measure. */
    const ruler = document.createElement('div');
    ruler.style.cssText = 'position:absolute;left:0;top:0;height:0;visibility:hidden';

    function measure() {
        const text = h2.firstChild;
        if (!text || text.nodeType !== 3) return false;

        const box = stage.getBoundingClientRect();
        if (!box.width) return false;

        const style = getComputedStyle(h2);
        const size = parseFloat(style.fontSize) || 96;
        k = size / 96;

        /* The rects a Range hands back are line boxes, not letters: their top
           is wherever the line starts, well above the ink. Their horizontal
           edges are exact though, so take x from the Range and y from the
           font's own metrics.

           The baseline sits inside a normal line box at half the leading plus
           the ascent, and the font knows both numbers. Then each character's
           own ascent and descent give where its ink actually stops - which is
           the difference between a bolt landing on the crossbar of an F and a
           bolt landing in the air above it. */
        canvas.font = style.fontStyle + ' ' + style.fontWeight + ' ' +
                      style.fontSize + ' ' + style.fontFamily;
        const line = canvas.measureText('Hxg');
        const fa = line.fontBoundingBoxAscent;
        const fd = line.fontBoundingBoxDescent;
        const haveMetrics = typeof fa === 'number' && typeof fd === 'number' &&
                            fa > 0 && (fa + fd) > 0;

        const range = document.createRange();
        const found = [];
        for (let i = 0; i < text.data.length; i++) {
            const ch = text.data[i];
            if (ch === ' ') continue;
            range.setStart(text, i);
            range.setEnd(text, i + 1);
            const r = range.getBoundingClientRect();
            if (!r.width) continue;

            let top, bottom;
            if (haveMetrics) {
                const base = r.top + (r.height - (fa + fd)) / 2 + fa;
                const m = canvas.measureText(ch);
                const up = m.actualBoundingBoxAscent;
                const down = m.actualBoundingBoxDescent;
                top = base - (up > 0 ? up : fa * 0.72);
                bottom = base + (down > 0 ? down : 0);
            } else {
                /* No font metrics: fall back to the proportions of a typical
                   display face inside its line box. Less exact, never wrong
                   enough to matter. */
                top = r.top + r.height * 0.26;
                bottom = r.top + r.height * 0.79;
            }
            found.push({
                left: r.left - box.left,
                right: r.right - box.left,
                top: top - box.top,
                bottom: bottom - box.top
            });
        }
        range.detach && range.detach();
        if (found.length < 2) return false;
        letters = found;

        band = letters.reduce((a, l) => ({
            left: Math.min(a.left, l.left), right: Math.max(a.right, l.right),
            top: Math.min(a.top, l.top), bottom: Math.max(a.bottom, l.bottom)
        }), { left: 1e9, right: -1e9, top: 1e9, bottom: -1e9 });

        brick = measureWall(box);
        return true;
    }

    /* The brickwork behind the title, so a bolt that hits the wall can run
       in its joints rather than across them.

       wallface.png is 2172 x 269 and holds four courses; the joints sit at
       66, 132 and 201, and a brick is about 163 across. Those are fractions
       of the tile, so they survive whatever the tile is being drawn at - and
       it is drawn at two different sizes, because the hero's camera move
       scales this element. offsetWidth is the layout width, the rect is the
       width after that transform, and the ratio between them is the zoom. */
    function measureWall(box) {
        if (!wall) return null;
        const r = wall.getBoundingClientRect();
        const layout = wall.offsetWidth;
        if (!r.width || !layout) return null;
        const zoom = r.width / layout;

        /* The tile's width is --wall-width, which is a max() of a percentage
           and a calc(). getComputedStyle hands back background-size with all
           of that still in it - "max(100%, 612.5px) auto" - so parsing it
           gets a NaN and the wall silently stops being brick.

           Measuring resolves it instead of parsing it: an empty box given
           that same width, inside this same element, comes out at whatever
           the max() works out to. Percentages resolve against the containing
           block, which here is the background positioning area, so the two
           agree by construction. */
        ruler.style.width = 'var(--wall-width)';
        wall.appendChild(ruler);
        const tile = ruler.offsetWidth * zoom;
        wall.removeChild(ruler);
        if (!(tile > 0)) return null;
        const height = tile * (269 / 2172);
        const course = height / 4;
        const brick = tile * (163 / 2172);

        /* Two scales, because the wall is not always drawn at a size that has
           anything to do with the heading.

           --wall-width is a max() of the viewport and the hero's height, so on
           a tall narrow phone the bricks come out enormous while the heading
           has dropped to 2em. Measured honestly, a single course is then more
           than twice the cap height and one brick is most of the width of the
           words - and light drawn at that scale is bigger than the title it
           belongs to, which looks wrong however right it is.

           So: the true course for deciding which joint a bolt lands on, where
           being exact is the whole point, and a capped one for how far the
           light spreads along it, where being proportionate is. On a desktop
           the two are the same number - a course there is 0.8 of the cap
           height and the cap never binds - and the alignment survives where
           anyone can see it. */
        const em = 96 * k;
        return {
            course: course,
            step: Math.min(course, em),
            brick: Math.min(brick, em * 2.4),
            /* the first joint, in stage-local pixels */
            first: r.top + height * (66 / 269) - box.top,
            height: height
        };
    }

    /* The nearest mortar joint to a given height. */
    function seamAt(y) {
        if (!brick || !(brick.course > 0)) return y;
        return brick.first + Math.round((y - brick.first) / brick.course) * brick.course;
    }

    /* ------------------------------------------------------------------ */
    /*  Pools                                                              */
    /*                                                                     */
    /*  Strikes arrive several times a second and leave again. Building and */
    /*  throwing away the elements would have the compositor allocating and */
    /*  freeing a layer at that rate; reusing a handful costs nothing and   */
    /*  keeps the layers warm. They grow to the cap and stop, which doubles */
    /*  as the limit on how much can be alight at once.                    */
    /* ------------------------------------------------------------------ */

    const everything = [];

    function makePool(className, cap) {
        const kept = [];
        return function take() {
            for (let i = 0; i < kept.length; i++) {
                if (!kept[i].busy) return kept[i];
            }
            if (kept.length >= cap) return null;
            const el = document.createElement('div');
            el.className = className;
            stage.appendChild(el);
            const item = { el: el, busy: false, anim: null };
            kept.push(item);
            everything.push(item);
            return item;
        };
    }

    const takeBolt = makePool('titleStrike', 9);
    const takeFlash = makePool('titleFlash', 3);
    const takeSeam = makePool('titleSeam', 3);

    function release(item) {
        if (item.anim) { item.anim.cancel(); item.anim = null; }
        item.el.style.opacity = '';
        item.busy = false;
    }

    function play(item, frames, options) {
        if (item.anim) item.anim.cancel();
        item.busy = true;
        const anim = item.el.animate(frames, options);
        item.anim = anim;
        anim.onfinish = () => { if (item.anim === anim) release(item); };
        anim.oncancel = () => { if (item.anim === anim) item.anim = null; };
        return anim;
    }

    /* ------------------------------------------------------------------ */
    /*  Drawing                                                            */
    /*                                                                     */
    /*  One <div> holding one <svg>. The div is what carries the flicker,   */
    /*  because opacity on an HTML element with will-change is a promise    */
    /*  the compositor keeps; opacity on an SVG group is not.               */
    /*                                                                     */
    /*  Inside, each polyline is written once into <defs> and referenced by */
    /*  every tier that draws it, so a bolt with a nine-step halo is one    */
    /*  path and nine short references rather than nine copies of it. The   */
    /*  tiers are drawn as groups across all the strokes, widest first, so  */
    /*  one bolt's faint outer halo never lands on top of another's core.   */
    /* ------------------------------------------------------------------ */

    let serial = 0;

    function render(item, strokes) {
        let left = 1e9, right = -1e9, top = 1e9, bottom = -1e9;
        for (const stroke of strokes) {
            for (const p of stroke.pts) {
                if (p.x < left) left = p.x;
                if (p.x > right) right = p.x;
                if (p.y < top) top = p.y;
                if (p.y > bottom) bottom = p.y;
            }
        }
        /* Room for the widest halo, or the viewport clips it off. */
        const pad = WIDEST * k * 0.5 + 2;
        left -= pad; top -= pad; right += pad; bottom += pad;
        const w = right - left, h = bottom - top;

        /* Unique per strike. A <use> resolves its reference against the
           whole document, so a pool of strikes all calling their first path
           "k0" would have every one of them drawing the oldest one's
           geometry - nine bolts, one shape. */
        const tag = 'k' + (serial++).toString(36) + '_';

        let defs = '';
        for (let i = 0; i < strokes.length; i++) {
            defs += '<path id="' + tag + i + '" d="' + path(strokes[i].pts) + '"/>';
        }

        let body = '';
        for (let t = 0; t < TIERS.length; t++) {
            let uses = '';
            for (let i = 0; i < strokes.length; i++) {
                const stroke = strokes[i];
                if (t < stroke.from) continue;
                uses += '<use href="#' + tag + i + '" stroke-width="' +
                        (TIERS[t][0] * k * stroke.scale).toFixed(2) + '"/>';
            }
            if (!uses) continue;
            body += '<g stroke="' + TIERS[t][2] + '" opacity="' +
                    TIERS[t][1].toFixed(3) + '">' + uses + '</g>';
        }

        item.el.style.left = left.toFixed(1) + 'px';
        item.el.style.top = top.toFixed(1) + 'px';
        item.el.style.width = w.toFixed(1) + 'px';
        item.el.style.height = h.toFixed(1) + 'px';
        item.el.innerHTML =
            '<svg viewBox="' + left.toFixed(1) + ' ' + top.toFixed(1) + ' ' +
            w.toFixed(1) + ' ' + h.toFixed(1) + '" preserveAspectRatio="none">' +
            '<defs>' + defs + '</defs>' +
            '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
            body + '</g></svg>';
    }

    /* Hard cuts, never a ramp: a discharge that fades up and down is a lamp
       on a dimmer. Only the last step is allowed to be smooth, because that
       one is the afterglow rather than the strike. */
    function flicker(peak, steps) {
        const frames = [{ offset: 0, opacity: peak, easing: 'steps(1, end)' }];
        let at = 0;
        for (let i = 0; i < steps; i++) {
            at += rnd(0.04, 0.13);
            if (at > 0.8) break;
            frames.push({ offset: at, opacity: rnd(0.12, 1) * peak,
                          easing: 'steps(1, end)' });
        }
        frames.push({ offset: 0.84, opacity: rnd(0.25, 0.6) * peak, easing: 'linear' });
        frames.push({ offset: 1, opacity: 0 });
        return frames;
    }

    /* ------------------------------------------------------------------ */
    /*  The two kinds of strike                                            */
    /* ------------------------------------------------------------------ */

    /* A point on a letter's ink, on whichever edge the bolt is leaving by. */
    function anchor(letter, up) {
        return {
            x: rnd(letter.left, letter.right),
            y: up ? letter.top + rnd(-2, 6) * k : letter.bottom + rnd(-6, 2) * k
        };
    }

    /* Letter to letter: the constant crackle along the words. Arcs over the
       top or sags under the bottom, never straight through, because a line
       between two letters just reads as an underline. */
    function crackle() {
        const item = takeBolt();
        if (!item) return;

        const i = (Math.random() * letters.length) | 0;
        let j = i + (chance(0.5) ? 1 : -1) * (1 + ((Math.random() * 5) | 0));
        j = Math.max(0, Math.min(letters.length - 1, j));
        if (j === i) j = i === 0 ? 1 : i - 1;

        const up = chance(0.58);
        const a = anchor(letters[i], up);
        const b = anchor(letters[j], up);
        const span = Math.abs(b.x - a.x) + 1;
        const lift = rnd(0.22, 0.6) * span + 12 * k;
        const apex = {
            x: (a.x + b.x) / 2 + rnd(-0.15, 0.15) * span,
            y: up ? Math.min(a.y, b.y) - lift : Math.max(a.y, b.y) + lift
        };

        const main = chain([a, apex, b], span * 0.14 + 6 * k, 5);
        const strokes = [{ pts: main, scale: rnd(0.72, 1), from: 0 }];
        const forks = (Math.random() * 3) | 0;
        for (let f = 0; f < forks; f++) {
            strokes.push({ pts: branch(main, 7 * k), scale: 0.6, from: 2 });
        }

        render(item, strokes);
        play(item, flicker(rnd(0.5, 1), 4 + ((Math.random() * 4) | 0)),
             { duration: rnd(170, 420), fill: 'forwards' });
    }

    /* Letter to wall: rarer, bigger, and the only one that ends somewhere
       other than on the words - so it is the only one that gets to do
       anything to the wall. */
    function strike() {
        const item = takeBolt();
        if (!item) return;

        const from = letters[(Math.random() * letters.length) | 0];
        const up = chance(0.62);
        const a = anchor(from, up);

        /* Out and away, in a cone rather than any direction at all: a bolt
           that leaves sideways and stops an inch later reads as a scratch. */
        const spread = rnd(-0.75, 0.75);
        const ang = (up ? -Math.PI / 2 : Math.PI / 2) + spread;
        const len = rnd(90, 230) * k;
        const end = { x: a.x + Math.cos(ang) * len, y: a.y + Math.sin(ang) * len };
        /* Land on a mortar line rather than near one: the joint is what
           lights up, so the bolt has to stop on one. */
        end.y = seamAt(end.y);

        const main = chain([a, { x: (a.x + end.x) / 2 + rnd(-30, 30) * k,
                                 y: (a.y + end.y) / 2 + rnd(-18, 18) * k }, end],
                           len * 0.13, 5);
        const strokes = [{ pts: main, scale: rnd(0.9, 1.15), from: 0 }];
        const forks = 1 + ((Math.random() * 3) | 0);
        for (let f = 0; f < forks; f++) {
            strokes.push({ pts: branch(main, 11 * k), scale: 0.62, from: 1 });
        }

        /* Where it lands is a real mortar joint, snapped to the grid above,
           so the light it leaves lies in the seam rather than across it. */
        const hit = { x: end.x, y: end.y };

        render(item, strokes);
        const life = rnd(430, 820);
        play(item, flicker(rnd(0.75, 1), 5 + ((Math.random() * 5) | 0)),
             { duration: life, fill: 'forwards' });

        impact(hit, len);
    }

    /* What the wall does about it.

       Two things, and between them they are the difference between a bolt
       that ends at the wall and a bolt that hits it. The flash is the light
       of the contact itself, thrown back off the brick. The seam is that
       light running away along the mortar line it landed on - a joint lit
       end to end for a moment, which is the thing that says the wall is
       made of something rather than being a backdrop the bolt stopped in
       front of. */
    function impact(hit, power) {
        const flash = takeFlash();
        if (flash) {
            const r = (36 + power * 0.26) * rnd(0.85, 1.2);
            flash.el.style.left = hit.x.toFixed(1) + 'px';
            flash.el.style.top = hit.y.toFixed(1) + 'px';
            flash.el.style.width = flash.el.style.height = (r * 2).toFixed(1) + 'px';
            play(flash, [
                { transform: 'translate(-50%, -50%) scale(0.35)', opacity: 0 },
                { offset: 0.1, transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { offset: 0.34, transform: 'translate(-50%, -50%) scale(1.06)', opacity: 0.55 },
                { transform: 'translate(-50%, -50%) scale(1.22)', opacity: 0 }
            ], { duration: rnd(260, 420), easing: 'cubic-bezier(.16,.7,.3,1)',
                 fill: 'forwards' });
        }

        if (!brick) return;
        const seam = takeSeam();
        if (!seam) return;
        seam.el.style.left = hit.x.toFixed(1) + 'px';
        seam.el.style.top = hit.y.toFixed(1) + 'px';
        /* Long enough to read as running along the joint, short enough to
           still belong to the impact that made it. */
        seam.el.style.width = (brick.brick * rnd(1.5, 2.5)).toFixed(1) + 'px';
        seam.el.style.height = (brick.step * rnd(0.34, 0.52)).toFixed(1) + 'px';
        play(seam, [
            { transform: 'translate(-50%, -50%) scaleX(0.18)', opacity: 0 },
            { offset: 0.12, transform: 'translate(-50%, -50%) scaleX(1)', opacity: 0.9 },
            { transform: 'translate(-50%, -50%) scaleX(1.1)', opacity: 0 }
        ], { duration: rnd(380, 620), easing: 'cubic-bezier(.1,.75,.3,1)',
             fill: 'forwards' });
    }

    /* ------------------------------------------------------------------ */
    /*  When any of it happens                                             */
    /* ------------------------------------------------------------------ */

    let timer = 0;
    let ready = false;
    let tries = 0;

    /* Assumed visible until the observer says otherwise, rather than assumed
       hidden until it says so. The observer's first callback is a task away,
       and starting from false means that if it never arrives - or arrives
       before there is anything to observe - the storm waits forever for a
       signal that has already been and gone. Starting from true, the worst
       case is one bolt drawn for a title that is off screen. */
    let onScreen = true;

    function tick() {
        timer = 0;
        if (!running()) return;
        if (chance(0.22)) strike(); else crackle();
        timer = setTimeout(tick, rnd(110, 480));
    }

    /* Off-screen, hidden, or switched off: nothing is scheduled at all. The
       old version left ten animations running whether or not the title was
       anywhere near the viewport, which is work the compositor does for a
       thing nobody is looking at. */
    function running() {
        return ready && onScreen && !document.hidden && !reduced.matches;
    }

    function start() {
        if (timer || !running()) return;
        timer = setTimeout(tick, rnd(60, 260));
    }

    function stop() {
        if (timer) { clearTimeout(timer); timer = 0; }
    }

    /* Asked for less movement: one quiet set of bolts, drawn once and left
       alone. The title keeps its lightning, the room keeps still. */
    function still() {
        const item = takeBolt();
        if (!item) return;
        const strokes = [];
        for (let i = 0; i < letters.length - 1; i += 2) {
            const up = chance(0.6);
            const a = anchor(letters[i], up);
            const b = anchor(letters[Math.min(i + 2, letters.length - 1)], up);
            const span = Math.abs(b.x - a.x) + 1;
            const apex = { x: (a.x + b.x) / 2,
                           y: up ? Math.min(a.y, b.y) - span * 0.4
                                 : Math.max(a.y, b.y) + span * 0.4 };
            strokes.push({ pts: chain([a, apex, b], span * 0.14 + 6 * k, 4),
                           scale: 0.8, from: 0 });
        }
        if (!strokes.length) return;
        render(item, strokes);
        item.busy = true;
        item.el.style.opacity = '0.5';
    }

    function rebuild() {
        stop();
        for (let i = 0; i < everything.length; i++) release(everything[i]);

        /* A failed measurement is not allowed to switch off a storm that was
           already working. measure() only commits its results once it has
           them, so what is here from last time is still true; and if it has
           never succeeded, it is worth asking again, because the usual
           reason to fail is being asked too early. */
        if (measure()) {
            ready = true;
            tries = 0;
        } else if (!ready) {
            if (tries++ < 8) setTimeout(rebuild, 150 * tries);
            return;
        }
        if (reduced.matches) still(); else start();
    }

    let pending = 0;
    function rebuildSoon() {
        if (pending) return;
        pending = setTimeout(() => { pending = 0; rebuild(); }, 160);
    }

    if (typeof IntersectionObserver === 'function') {
        new IntersectionObserver(entries => {
            onScreen = entries[entries.length - 1].isIntersecting;
            if (onScreen) { if (!ready) rebuild(); else start(); } else stop();
        }, { rootMargin: '150px' }).observe(h2);
    } else {
        onScreen = true;
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop(); else start();
    });
    window.addEventListener('resize', rebuildSoon);
    reduced.addEventListener('change', rebuildSoon);

    /* The letters are not where they will be until the face they are set in
       has arrived - Berylium is a webfont, and measuring before it lands
       pins every bolt to the fallback's letter positions. */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(rebuild);
    }
    rebuild();
})();
