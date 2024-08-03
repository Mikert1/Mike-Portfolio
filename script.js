let hr = (new Date()).getHours();
const helloText = document.getElementById('welcome');
if (hr < 12) {
    helloText.innerHTML = 'A very Good Morning';
} else if (hr < 18) {
    helloText.innerHTML = 'A very Good Afternoon';
} else {
    helloText.innerHTML = 'A very Good Evening';
}
helloText.innerHTML += ', I am Mike and Welcome to my website!';

async function getData() {
    try {
        const response = await fetch('projects.json');
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

let gameProjectsCount = 0;
getData()
    .then(data => {
        const gameProjects = data.filter(project => project.project === 'solo');
        gameProjectsCount = gameProjects.length;
        console.log(`Number of game projects: ${gameProjectsCount}`);
        resize()
    })
    .catch(error => {
        console.error('Error fetching:', error);
    });

function resize() {
    if (window.innerWidth < 500) {
        const num = gameProjectsCount * 450 + 10;
        document.getElementById('MyOwnProjects').height = num;
    } else {
        document.getElementById('MyOwnProjects').height = '450px';
    }
}

window.addEventListener('resize', () => {
    resize()
});