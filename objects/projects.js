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

getData()
    .then(data => {
        console.log(data);
        data.forEach(project => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('p').textContent = project.name + ' · ' + project.type;
            clone.querySelector('h2').textContent = project.lang;
            clone.querySelector('h4').textContent = project.description;
            clone.querySelector('div').addEventListener('click', () => {
                window.location.href = `../project.html?id=${project.id}`;
            });
            clone.querySelector('img').src = `${project.images[0]}`;
            document.getElementById('projects').appendChild(clone);
        });
    });