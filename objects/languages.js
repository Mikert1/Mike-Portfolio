const template = document.getElementById('template');

async function getData() {
    try {
        const response = await fetch('../languages.json');
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
    data.forEach(Langs => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.name').textContent = Langs.name;
        clone.querySelector('.image').src = `../assets/img/languages/${Langs.name}.png`;
        clone.querySelector('.description').textContent = Langs.description;
        const currentDate = new Date();
        const projectDate = new Date(Langs.since);
        const timeDifference = Math.abs(currentDate - projectDate);
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        if (daysDifference >= 730) {
            const yearsSince = Math.floor(daysDifference / 365);
            clone.querySelector('.experience').textContent = yearsSince + ' year' + '+ experience';
        } else {
            clone.querySelector('.experience').textContent = daysDifference + ' days experience';
        }
        document.getElementById('languages').appendChild(clone);
    });
});