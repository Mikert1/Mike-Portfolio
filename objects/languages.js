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
        // clone.querySelector('.image').src = Langs.image;
        document.getElementById('languages').appendChild(clone);
    });
});