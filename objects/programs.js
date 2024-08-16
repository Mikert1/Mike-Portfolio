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
        const sinceDate = new Date(program.since);
        const currentDate = new Date();
        const daysSince = Math.floor((currentDate - sinceDate) / (1000 * 60 * 60 * 24));

        if (daysSince >= 365) {
            const yearsSince = Math.floor(daysSince / 365);
            clone.querySelector('.time').textContent = yearsSince + ' year' + (yearsSince > 1 ? 's' : '') + '+ experience';
        } else {
            clone.querySelector('.time').textContent = daysSince + ' days experience';
        }
        clone.querySelector('.description').textContent = program.description;
        if (!program.bar) {
            clone.querySelector('.bar').style.display = 'none';
        } else {
            clone.querySelector('.progress').style.width = program.bar.progress + '%';
            clone.querySelector('.progress').style.backgroundColor = program.bar.color;
            clone.querySelector('.progressText').textContent = program.bar.text;
            clone.querySelector('.progressText').style.color = program.bar.textColor;
        }
        document.getElementById('programs').appendChild(clone);
    });
});