const template = document.getElementById('template');

async function getData() {
    try {
        const response = await fetch('../programs.json');
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
    data.forEach(program => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.image').src = "../assets/img/svg/" + program.name + ".svg";
        clone.querySelector('.name').textContent = program.name;
        clone.querySelector('.description').textContent = program.description;
        if (!program.bar) {
            clone.querySelector('.bar').style.display = 'none';
        } else {
            clone.querySelector('.progress').style.width = program.bar.progress + '%';
            clone.querySelector('.progress').style.backgroundColor = program.bar.color;
        }
        document.getElementById('programs').appendChild(clone);
    });
});