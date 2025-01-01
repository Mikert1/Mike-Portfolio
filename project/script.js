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

async function fetchGithub(name) {
    const localStorageKey = `githubData-${name}`;
    const cachedData = localStorage.getItem(localStorageKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    } else {
        try {
            console.log('No Data Found in localStorage. getting from API');
            const response = await fetch(`https://api.github.com/repos/mikert1/${name}`);
            console.log(response);
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }
            const data = await response.json();
            localStorage.setItem(localStorageKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error fetching:', error);
            throw error;
        }
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

const page = {
    title: document.getElementById('title'),
    description: document.getElementById('description'),
    platforms: document.getElementById('platforms'),
    status: document.getElementById('status'),
    date: document.getElementById('date'),
    lang: document.getElementById('lang'),
    version: document.getElementById('version'),
    contributors: document.getElementById('contributors'),
    moreLang: document.getElementById('moreLang'),
    moreContributors: document.getElementById('moreContributors'),

    mainImage: document.getElementById('main-image'),
}

const buttons = document.getElementById('buttons');

let amountOfImages = 0;

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
    console.log(await fetchGithub(project.rawName));
    page.title.textContent = project.name;
    const logo = document.getElementById('logo');
    logo.src = `../assets/projects/${project.name}/logo.png`;
    page.description.textContent = project.description;
    if (project.platforms) {
        for (let i = 0; i < project.platforms.length; i++) {
            fetch(`../assets/img/svg/${project.platforms[i]}.svg`)
            .then(response => response.text())
            .then(data => {
                const div = document.createElement('div');
                div.innerHTML = data;
                page.platforms.appendChild(div);
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
        page.status.appendChild(spanElement);
    }
    page.date.textContent = project.date;
    const langEntries = Object.keys(project.lang);
    langEntries.forEach((n, index) => {
        const dot = index < langEntries.length - 1 ? ', ' : ' ';
        const span = document.createElement('span');
        span.textContent = n;
        page.lang.appendChild(span);
        page.lang.innerHTML += dot;
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
        page.moreLang.appendChild(span);
    });
    for (let i = 0; i < 10; i++) {
        const img = new Image();
        img.src = `../assets/projects/${project.name}/${i + 1}.png`;
        img.onload = () => {
            amountOfImages++;
            const div = document.createElement('div');
            img.id = `image${i + 1}`;
            div.appendChild(img);
            div.addEventListener('click', () => {
                page.mainImage.src = img.src;
            });
            document.querySelector('.sub-images').appendChild(div);
        };
        img.onerror = () => {
            if (i === 0) {
                amountOfImages = 0;
            }
        };
    }
    page.mainImage.src = `../assets/projects/${project.name}/1.png`;
    document.title = "Mikert.com | " + project.name;
    const svg = document.getElementById("svg");
    const primaryButton = document.getElementById('mainButton');
    const primaryButtonStyle = primaryButton.querySelector(".primaryButton").style;
    primaryButtonStyle.backgroundColor = project.color.background;
    primaryButton.addEventListener('mouseenter', () => {
        primaryButtonStyle.backgroundColor = project.color.hover;
    });
    primaryButton.addEventListener('mouseleave', () => {
        primaryButtonStyle.backgroundColor = project.color.background;
    });
    const arrows = document.querySelectorAll('.arrow');
    arrows.forEach((arrow) => {
        console.log(arrow);
        arrow.style.borderColor = project.color.background;
        arrow.querySelector('svg').style.fill = project.color.background;
    });
    if (project.type === 'Game') {
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
        primaryButton.querySelector('p').innerHTML = 'Download';
        primaryButton.href = project.releases;
        document.getElementById('4thDisplay').innerHTML = "Version";
        page.status.innerHTML = '<p class="m-0">' + project.versionPrefix + '<span>' + project.version + '</span>' + project.versionSuffix + '</p>';;
    } else if (project.type === 'Website') {
        primaryButton.querySelector('p').innerHTML = 'Visit Website';
        primaryButton.href = project.link;
        page.version.innerHTML = "";
        svg.style.display = 'none';
        
    }
    const stack = document.getElementById('stack');
    stack.innerHTML = project.stack;
    const contributorEntries = Object.keys(project.contributors);
    contributorEntries.forEach((n, index) => {
        const img = document.createElement('img');
        img.src = project.contributors[n].image;
        page.contributors.appendChild(img);

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
        page.moreContributors.appendChild(div);
    });

    const next = document.getElementById('next');
    const prev = document.getElementById('prev');
    let selectedImage = 1;

    next.addEventListener('click', () => {
        selectedImage++;
        if (selectedImage > amountOfImages) {
            selectedImage = 1;
        }
        page.mainImage.src = `../assets/projects/${project.name}/${selectedImage}.png`;
    });

    prev.addEventListener('click', () => {
        selectedImage--;
        if (selectedImage < 1) {
            selectedImage = amountOfImages;
        }
        page.mainImage.src = `../assets/projects/${project.name}/${selectedImage}.png`;
    });

    const source = document.getElementById('source');
    source.href = project.repository;
    const subImages = document.querySelectorAll('.sub-images div img');
    subImages.forEach((image) => {
        image.addEventListener('click', (e) => {
            document.getElementById('main-image').src = e.target.src;
        });
    });

    const note = document.getElementById('note');
    if (project.note) {
        note.querySelector("h2").textContent = project.note.title;
        note.querySelector("p").textContent = project.note.description;
        note.style.borderColor = project.note.color;
        note.style.backgroundColor = project.note.color + "11";

    } else {
        note.style.display = 'none';
    }
}
setProject();