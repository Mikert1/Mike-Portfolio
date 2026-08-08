const template = document.getElementById('template');

async function getData() {
    try {
        const response = await fetch('../data/projects.json');
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

const urlParams = new URLSearchParams(window.location.search);
const group = urlParams.get('project') || 'solo';

let cardAmount = 0;

/* The row on the homepage is the shortlist: anything marked "archived" in
   projects.json is left out and reachable through the tile at the end. */
async function setPage() {
    const data = await getData();
    const groupProjects = projectsInGroup(data, group);
    const shown = groupProjects.filter(project => !project.archived);
    const archivedCount = groupProjects.length - shown.length;

    for (const project of shown) {
        cardAmount++;
        const card = await buildProjectCard(project, template, '..');
        document.getElementById('projects').appendChild(card);
    }

    if (archivedCount > 0) {
        cardAmount++;
        document.getElementById('projects').appendChild(buildOlderTile(archivedCount));
    }
}

function buildOlderTile(archivedCount) {
    const link = document.createElement('a');
    link.className = 'olderCard d-f fd-c jc-c ai-c g-10px';
    link.href = `/projects/?group=${group}#older`;
    link.target = '_top';
    link.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.582.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
            <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
            <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
        </svg>
        <p class="fontw-b font-1.1rem">Show older projects</p>
        <p class="textMuted">${archivedCount} more</p>
    `;
    return link;
}

const next = document.getElementById('next');
const prev = document.getElementById('prev');
const cardWidth = 430;

next.addEventListener('click', () => {
    let currentScrollX = document.documentElement.scrollLeft || document.body.scrollLeft;

    let nextScrollX = Math.ceil(currentScrollX / cardWidth) * cardWidth + cardWidth;

    window.scrollTo({
        top: 0,
        left: nextScrollX,
        behavior: 'smooth'
    });
});

prev.addEventListener('click', () => {
    let currentScrollX = document.documentElement.scrollLeft || document.body.scrollLeft;

    let prevScrollX = Math.floor(currentScrollX / cardWidth) * cardWidth - cardWidth;

    if (prevScrollX < 0) {
        prevScrollX = 0;
    }

    window.scrollTo({
        top: 0,
        left: prevScrollX,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollX < 100) {
        prev.style.display = 'none';
    } else {
        prev.style.display = 'flex';
    }
    if (window.scrollX + 859 > cardAmount * 430) {
        next.style.display = 'none';
    } else {
        next.style.display = 'flex';
    }
});

setPage()
