const template = document.getElementById('template');

async function getData(file) {
    try {
        const response = await fetch(`../${file}.json`);
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



getData("languages").then(data => {
    data.forEach(Langs => {
        getData("certificates").then(certificates => {
            getData("projects").then(projects => {
                const clone = template.content.cloneNode(true);
                clone.querySelector('.name').textContent = Langs.name;
                clone.querySelector('.image').src = `../assets/img/languages/${Langs.name}.png`;
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
        });
    });
});