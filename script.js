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