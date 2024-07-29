const template = document.getElementById('template');

async function getData() {
    try {
        const response = await fetch('../projects.json');
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

getData()
.then(data => {
    const filteredData = data.filter(project => project.project == projectType);
        filteredData.forEach(project => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.name').innerHTML = '<span>' + project.name + ' · ' + project.type + '</span>';
            clone.querySelector('h2').innerHTML = '<span>' + project.lang + '</span>';
            const description = project.description.length > 90 ? project.description.slice(0, 90) + '...' : project.description;
            clone.querySelector('.description').textContent = description;
            const currentDate = new Date();  
            const projectDate = new Date(project.date);
            const timeDifference = Math.abs(currentDate - projectDate);
            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

            clone.querySelector('.date').innerHTML = `Created <span>${daysDifference}</span> days ago | <span>${project.status}</span>`;
            clone.querySelector('div').addEventListener('click', () => {
                top.location.href = `../project.html?id=${project.id}`;
            });
            clone.querySelector('img').src = `${project.images[0]}`;
            document.getElementById('projects').appendChild(clone);
        });
    });