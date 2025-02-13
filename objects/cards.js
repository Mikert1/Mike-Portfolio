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
let projectType = urlParams.get('project');

let cardAmount = 0;

async function setPage() {
    const data = await getData();
    const order = [/*my own part*/ 2, 1, 11, 7, 4, 8, /*school part*/ 5, 3, 10, 6, 9];
    const filteredData = data.filter(project => project.project == projectType);
    filteredData.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    for (const project of filteredData) {
        cardAmount++;
        const shortedName = project.name.length > 25 ? project.name.slice(0, 25) + '...' : project.name;
        const clone = template.content.cloneNode(true);
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
        clone.querySelector('.team').textContent = project.contributors;
        const contributorsLength = Object.keys(project.contributors).length;
        clone.querySelector('.team').innerHTML = contributorsLength > 1 ? `Team of <span>${contributorsLength}</span>` : `<span>Solo</span> project`;
        clone.querySelector('.link').href = `/project/?id=${project.id}`;
        if (project.type === 'Framework') {
            const url = `../assets/projects/${project.name}/logo.png`;
            const response = await fetch(url);
            if (response.status === 200) {
                clone.querySelector('img').src = url;
            } else {
                Object.assign(clone.querySelector('img').style, { height: '150px', width: '150px', objectFit: 'contain' });
                clone.querySelector('img').src = `../assets/projects/${project.name}/logo.svg`;
            }
            if (response.status === 200) {
                clone.querySelector('img').src = url;
            } else {
                clone.querySelector('img').src = `../assets/projects/${project.name}/logo.svg`;
            }
        } else if (project.cardImage) {
            clone.querySelector('img').src = `../assets/projects/${project.name}/card.png`;
            clone.querySelector('.head').style.backgroundImage = `url('../assets/projects/${project.name}/background.png')`;
            clone.querySelector('.head').style.backgroundSize = 'cover';
        } else {
            clone.querySelector('img').src = `../assets/projects/${project.name}/1.png`;
        }
        let projectCard = clone.querySelector('.project');
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
        document.getElementById('projects').appendChild(clone);
    }
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