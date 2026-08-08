const template = document.getElementById('template');
const container = document.getElementById('projects');

const urlParams = new URLSearchParams(window.location.search);
const group = PROJECT_GROUPS[urlParams.get('group')] ? urlParams.get('group') : 'solo';

async function getData() {
    try {
        const response = await fetch('../data/projects.json');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
}

function markActiveTab() {
    const active = group === 'school' ? 'tabSchool' : 'tabSolo';
    document.getElementById(active).classList.add('groupTabActive');
    document.getElementById('groupTitle').textContent = GROUP_LABELS[group];
}

/* Everything in the group, shortlist first and the archived ones after a
   divider. The divider carries id="older" so the "Show older projects" tile
   on the homepage can link straight to where the hidden ones begin. */
async function setPage() {
    const data = await getData();
    const groupProjects = projectsInGroup(data, group);
    const shown = groupProjects.filter(project => !project.archived);
    const archived = groupProjects.filter(project => project.archived);

    for (const project of shown) {
        container.appendChild(await buildProjectCard(project, template, '..'));
    }

    if (archived.length > 0) {
        container.appendChild(buildOlderDivider(archived.length));
        for (const project of archived) {
            container.appendChild(await buildProjectCard(project, template, '..'));
        }
    }

    // The cards only exist now, so the browser's own jump to #older on load
    // had nothing to aim at — do it here instead.
    if (window.location.hash === '#older') {
        document.getElementById('older')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function buildOlderDivider(count) {
    const divider = document.createElement('div');
    divider.id = 'older';
    divider.className = 'olderDivider d-f fd-c g-5px w-100%';
    divider.innerHTML = `
        <h2 class="m-0">Older projects</h2>
        <p class="m-0 textMuted">${count} project${count === 1 ? '' : 's'} kept off the homepage, still here.</p>
    `;
    return divider;
}

markActiveTab();
setPage();
