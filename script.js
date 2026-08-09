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

    const layers = Array.from(hero.querySelectorAll('[data-depth]'), element => ({
        element,
        depth: parseFloat(element.dataset.depth) || 0
    }));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let queued = false;
    let lastOffset = null;
    let barShown = false;

    function render() {
        queued = false;
        const height = hero.offsetHeight;
        /* Clamped: once the hero has scrolled past there is nothing left to
           see, and letting the numbers run on would fling the layers away. */
        const offset = Math.min(window.scrollY, height);
        if (offset === lastOffset) return;
        lastOffset = offset;

        const progress = offset / height;
        hero.style.setProperty('--hero-progress', progress.toFixed(4));

        if (!reduced.matches) {
            for (const layer of layers) {
                layer.element.style.transform = `translate3d(0, ${(offset * layer.depth).toFixed(2)}px, 0)`;
            }
        }

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

    function onMotionPreferenceChange() {
        if (reduced.matches) {
            for (const layer of layers) layer.element.style.transform = '';
        }
        lastOffset = null;
        render();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    reduced.addEventListener('change', onMotionPreferenceChange);

    render();
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