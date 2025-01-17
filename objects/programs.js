const template = document.getElementById('template');

async function getData() {
    try {
        const response = await fetch('../data/programs.json');
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

getData()
.then(data => {
    data.forEach(program => {
        cardAmount++;
        const clone = template.content.cloneNode(true);
        clone.querySelector('.image').src = "../assets/img/svg/" + program.name + ".svg";
        clone.querySelector('.name').textContent = program.name;
        const sinceDate = new Date(program.since);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - sinceDate) / (1000 * 60 * 60 * 24));

        const timeElement = clone.querySelector('.time');
        if (daysDifference >= 365) {
            const yearsSince = Math.floor(daysDifference / 365);
            timeElement.innerHTML = `<span>${yearsSince}</span>+ year${yearsSince > 1 ? 's' : ''} experience`;
        } else {
            timeElement.innerHTML = `<span>${daysDifference}</span> days experience`;
        }
        clone.querySelector('.description').textContent = program.description;
        if (!program.bar) {
            clone.querySelector('.bar').style.display = 'none';
        } else {
            clone.querySelector('.progress').style.width = program.bar.progress + '%';
            clone.querySelector('.progress').style.backgroundColor = program.bar.color;
            clone.querySelector('.amount').innerHTML = `<span>${program.bar.progress}</span>%`;
        }
        document.getElementById('programs').appendChild(clone);
    });
});

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