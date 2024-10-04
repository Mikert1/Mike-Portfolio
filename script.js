let hr = (new Date()).getHours();
// const helloText = document.getElementById('welcome');
// if (hr < 12) {
//     helloText.innerHTML = 'A very Good Morning';
// } else if (hr < 18) {
//     helloText.innerHTML = 'A very Good Afternoon';
// } else {
//     helloText.innerHTML = 'A very Good Evening';
// }
// helloText.innerHTML += ', Welcome to my website!';

async function getProjects() {
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

async function getPrograms() {
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

async function getLanguages() {
    try {
        const response = await fetch('languages.json');
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

getProjects()
    .then(data => {
        const gameProjects = data.filter(project => project.project === 'solo');
        myOwnProjectsCount = gameProjects.length;
        console.log(`Number of game projects: ${myOwnProjectsCount}`);
        const schoolProjects = data.filter(project => project.project === 'school');
        schoolProjectsCount = schoolProjects.length;

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
        const num4 = languagesCount * 250 + 10;
        document.getElementById('myOwnProjects').height = num;
        document.getElementById('schoolProjects').height = num2;
        document.getElementById('programs-object').height = num3;
        document.getElementById('languages-object').height = num4;
    } else {
        document.getElementById('myOwnProjects').height = '450px';
        document.getElementById('schoolProjects').height = '450px';
        document.getElementById('programs-object').height = '150px';
        document.getElementById('languages-object').height = '300px';
    }
}

window.addEventListener('resize', () => {
    resize()
});