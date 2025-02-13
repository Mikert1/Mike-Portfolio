const template = document.getElementById('template');

async function getData(file) {
    try {
        const response = await fetch(`../data/${file}.json`);
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

let cardAmount = 1;

async function load() {
    const certificates = await getData("certificates")
    const projects = await getData("projects")
    const data = await getData("languages")
    data.forEach(Langs => {
        cardAmount++;
        const clone = template.content.cloneNode(true);
        clone.querySelector('.name').textContent = Langs.name;
        clone.querySelector('.image').src = `../assets/img/languages/rotated/${Langs.name}.png`;
        clone.querySelector('.description').textContent = Langs.description;
        const currentDate = new Date();
        const projectDate = new Date(Langs.since);
        const timeDifference = Math.abs(currentDate - projectDate);
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        const experienceElement = clone.querySelector('.experience');
        if (daysDifference >= 730) {
            const yearsSince = Math.floor(daysDifference / 365);
            experienceElement.innerHTML = `<span>${yearsSince}</span>+ year experience`;
        } else {
            experienceElement.innerHTML = `<span>${daysDifference}</span> days experience`;
        }

        const langCertificates = certificates.filter(cert => cert.part_of.includes(Langs.name));
        clone.querySelector('.certificates').textContent = langCertificates.length;
        
        let LangProjects = [];
        for (let i = 0; i < projects.length; i++) {
            const langEntries = Object.keys(projects[i].lang);
            langEntries.forEach((n) => {
                if (Langs.name == n) {
                    LangProjects.push(n);
                }
            });
        }
        clone.querySelector('.projects').textContent = LangProjects.length;

        document.getElementById('languages').appendChild(clone);
    });
}

load();

const next = document.getElementById('next');
const prev = document.getElementById('prev');
const cardWidth = 450;

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