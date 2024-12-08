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

function getQueryParams() {
    let params = {};
    let queryString = window.location.search.slice(1);
    let queryArray = queryString.split('&');
    queryArray.forEach(function(param) {
        let [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}


let params = getQueryParams();
if (params.id) {
    params.id = parseInt(params.id) - 1;
    console.log(params.id);
} else {
    console.log("No name provided");
}

const title = document.getElementById('title');
const description = document.getElementById('description');
const platforms = document.getElementById('platforms');
const status = document.getElementById('status');
const date = document.getElementById('date');
const lang = document.getElementById('lang');
const version = document.getElementById('version');
const contributors = document.getElementById('contributors');
const moreLang = document.getElementById('moreLang');
const moreContributors = document.getElementById('moreContributors');

const mainImage = document.getElementById('main-image');
const image1 = document.getElementById('image1');
const image2 = document.getElementById('image2');
const image3 = document.getElementById('image3');
const image4 = document.getElementById('image4');
const image5 = document.getElementById('image5');
const buttons = document.getElementById('buttons');

let data;

async function getWebsiteStatus(url) {
    try {
        const response = await fetch(url);
        if (response.status >= 200 && response.status < 300) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error fetching:', error);
        return false;
    }
}

async function setProject() {
    data = await getData();
    const project = data[params.id];
        title.textContent = project.name;
        description.textContent = project.description;
        if (project.platforms) {
            for (let i = 0; i < project.platforms.length; i++) {
                fetch(`../assets/img/svg/${project.platforms[i]}.svg`)
                .then(response => response.text())
                .then(data => {
                    const div = document.createElement('div');
                    div.innerHTML = data;
                    platforms.appendChild(div);
                });
            }
        }
        if (project.type === 'Website') {
            const output = await getWebsiteStatus(project.link);
            const spanElement = document.createElement('span');
            if (output == true) {
                spanElement.textContent = 'Online';
                spanElement.classList.add('statusDone');
            } else {
                spanElement.textContent = 'Offline';
                spanElement.classList.add('statusInactive');
            }
            status.appendChild(spanElement);
        } else {
            status.style.display = 'none';
        }
        date.textContent = project.date;
        const langEntries = Object.keys(project.lang);
        langEntries.forEach((n, index) => {
            const dot = index < langEntries.length - 1 ? ', ' : ' ';
            const span = document.createElement('span');
            span.textContent = n;
            lang.appendChild(span);
            lang.innerHTML += dot;
            if (project.lang[n].Lines) {
                const p = document.createElement('p'); p.classList.add('m0');
                p.textContent = project.lang[n].Lines + ' lines';
                span.appendChild(p);
            }
            if (project.lang[n].Files) {
                const p = document.createElement('p'); p.classList.add('m0');
                p.textContent = project.lang[n].Files + ' files';
                span.appendChild(p);
            }
            moreLang.appendChild(span);
        });
        for (let i = 0; i < 5; i++) {
            const div = document.createElement('div');
            let img = document.createElement('img');
            img.src = `../assets/projects/${project.name}/${i + 1}.png`;
            img.id = `image${i + 1}`;
            div.appendChild(img);
            document.querySelector('.sub-images').appendChild(div);
            document.title = "Mikert.com | " + project.name;
        }
        mainImage.src = `../assets/projects/${project.name}/1.png`;
        const svg = document.getElementById("svg");
        if (project.type === 'Game') {
            const download = document.getElementById('mainButton');
            let osName = window.navigator.platform;
            if (osName.includes('Win')) {
                osName = '../assets/img/svg/windows.svg';
            } else if (osName.includes('Mac')) {
                osName = '../assets/img/svg/mac.svg';
            } else if (osName.includes('Linux')) {
                osName = '../assets/img/svg/linux.svg';
            } else {
                osName = '../assets/img/svg/download.svg';
            }
            fetch(osName)
                .then(response => response.text())
                .then(data => {
                    svg.innerHTML = data;
                });
            download.querySelector('h2').innerHTML = 'Download';
            download.href = project.releases;
            version.innerHTML = version.innerHTML + '<p>' + project.versionPrefix + '<span>' + project.version + '</span>' + project.versionSuffix + '</p>';
        } else if (project.type === 'Website') {
            const link = document.getElementById('mainButton');
            link.querySelector('h2').innerHTML = 'Visit Website';
            link.href = project.link;
            version.innerHTML = "";
            svg.style.display = 'none';
        }
        const contributorEntries = Object.keys(project.contributors);
        contributorEntries.forEach((n, index) => {
            const img = document.createElement('img');
            img.src = project.contributors[n].image;
            contributors.appendChild(img);

            const div = document.createElement('div');
            const innerDiv = document.createElement('div'); innerDiv.classList.add('flex-ai-center', 'gap');
            const img2 = document.createElement('img'); 
            img2.src = project.contributors[n].image;
            innerDiv.appendChild(img2);
            innerDiv.innerHTML += n;
            div.appendChild(innerDiv);
            if (project.contributors[n].role) {
                div.innerHTML += ' - ' + project.contributors[n].role;
            }
            moreContributors.appendChild(div);
        });
        const source = document.getElementById('source');
        source.href = project.repository;
        const subImages = document.querySelectorAll('.sub-images div img');
        subImages.forEach((image) => {
            image.addEventListener('click', (e) => {
                document.getElementById('main-image').src = e.target.src;
            });
        });
}

setProject();