/**
 * Shared project-card rendering, used by both the homepage rows (which live
 * inside objects/) and the all-projects page. They sit at different depths,
 * so every asset path is built from `assetBase` instead of being hardcoded.
 */

/* Which values of a project's "project" field belong to which homepage row.
   School and work share a row: both are things I built for someone else. */
const PROJECT_GROUPS = {
    solo: ['solo'],
    school: ['school', 'work']
};

/* Display order per group, best first. An id that isn't listed sorts to the
   front, which is how the newest additions lead each row. */
const PROJECT_ORDER = {
    solo: [14, 12, 2, 1, 11, 7, 4, 8],
    school: [13, 5, 3, 10, 6, 9]
};

const GROUP_LABELS = {
    solo: 'My own',
    school: 'School & work'
};

function projectsInGroup(data, group) {
    const types = PROJECT_GROUPS[group] || PROJECT_GROUPS.solo;
    const order = PROJECT_ORDER[group] || [];
    return data
        .filter(project => types.includes(project.project))
        .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

/**
 * Fill a clone of the shared card <template> for one project.
 *
 * @param {Object} project - one entry from data/projects.json
 * @param {HTMLTemplateElement} template - the card template on the page
 * @param {string} assetBase - prefix for assets, e.g. '..' or ''
 * @returns {Promise<DocumentFragment>}
 */
async function buildProjectCard(project, template, assetBase) {
    const clone = template.content.cloneNode(true);

    const shortedName = project.name.length > 25 ? project.name.slice(0, 25) + '...' : project.name;
    clone.querySelector('.name').innerHTML = '<span>' + shortedName + '</span> · ' + project.type;
    clone.querySelector('.status').textContent = project.status;
    clone.querySelector('.status').classList.add(`status${project.status}`);

    const langEntries = Object.keys(project.lang);
    langEntries.forEach((n, index) => {
        const dot = index < langEntries.length - 1 ? ', ' : ' ';
        const span = document.createElement('span');
        span.textContent = n;
        clone.querySelector('.lang').appendChild(span);
        clone.querySelector('.lang').innerHTML += dot;
    });

    const description = project.description.length > 90 ? project.description.slice(0, 90) + '...' : project.description;
    clone.querySelector('.description').textContent = description;

    const currentDate = new Date();
    const projectDate = new Date(project.date);
    const timeDifference = Math.abs(currentDate - projectDate);
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    const createdElement = clone.querySelector('.date');
    if (daysDifference >= 730) {
        const yearsSince = Math.floor(daysDifference / 365);
        createdElement.innerHTML = `Created <span>${yearsSince}</span>+ years ago`;
    } else {
        createdElement.innerHTML = `Created <span>${daysDifference}</span> days ago`;
    }

    const contributorsLength = Object.keys(project.contributors).length;
    clone.querySelector('.team').innerHTML = contributorsLength > 1
        ? `Team of <span>${contributorsLength}</span>`
        : `<span>Solo</span> project`;

    clone.querySelector('.link').href = `/project/?id=${project.id}`;

    const imageDir = `${assetBase}/assets/projects/${project.name}`;
    const img = clone.querySelector('img');
    if (project.type === 'Framework') {
        // Frameworks have no screenshot, so they show a logo — png if there
        // is one, otherwise the svg, scaled down to sit inside the header.
        const url = `${imageDir}/logo.png`;
        const response = await fetch(url);
        if (response.status === 200) {
            img.src = url;
        } else {
            Object.assign(img.style, { height: '150px', width: '150px', objectFit: 'contain' });
            img.src = `${imageDir}/logo.svg`;
        }
    } else if (project.cardImage) {
        img.src = `${imageDir}/card.png`;
        clone.querySelector('.head').style.backgroundImage = `url('${imageDir}/background.png')`;
        clone.querySelector('.head').style.backgroundSize = 'cover';
    } else {
        img.src = `${imageDir}/1.png`;
    }

    /* "Masterpiece", laid over the screenshot, for whichever project carries
       "masterpiece": true in projects.json. Built here rather than added to
       the two card templates -- objects/cards.html and projects/index.html --
       so the homepage rows and the all-projects page cannot drift apart.
       The icon is lucide's drafting-compass. */
    if (project.masterpiece) {
        const badge = document.createElement('div');
        badge.className = 'masterpieceBadge';
        badge.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m12.99 6.74 1.93 3.44"/>
                <path d="M19.136 12a10 10 0 0 1-14.271 0"/>
                <path d="m21 21-2.16-3.84"/>
                <path d="m3 21 8.02-14.26"/>
                <circle cx="12" cy="5" r="2"/>
            </svg>
            <p>Masterpiece</p>
        `;
        clone.querySelector('.head').appendChild(badge);
    }

    // Hovering pans the screenshot down to its bottom, then releases it.
    const projectCard = clone.querySelector('.project');
    let intervalId;
    projectCard.addEventListener('mouseenter', () => {
        projectCard.classList.add('hover');
        intervalId = setInterval(() => {
            projectCard.classList.remove('hover');
        }, 2000);
    });
    projectCard.addEventListener('mouseleave', () => {
        projectCard.classList.remove('hover');
        clearInterval(intervalId);
    });

    return clone;
}
