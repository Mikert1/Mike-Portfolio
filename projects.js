async function getData() {
    try {
        const response = await fetch('projects.json');
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
const version = document.getElementById('version');

getData()
    .then(data => {
        console.log(data);
        title.textContent = data[params.id].name;
        description.textContent = data[params.id].description;
        if (data[params.id].platforms) {
            for (let i = 0; i < data[params.id].platforms.length; i++) {
                let img = document.createElement('img');
                img.classList.add('platform');
                img.alt = data[params.id].platforms[i];
                img.src = `assets/img/logos/${data[params.id].platforms[i]}.png`;
                platforms.appendChild(img);
            }
        }
        version.innerHTML = data[params.id].versionPrefix + data[params.id].version + data[params.id].versionSuffix;
    });

subImages = document.querySelectorAll('.game-prefiew-image div img');
subImages.forEach((image) => {
    image.addEventListener('mouseover', (e) => {
        document.getElementById('main-image').src = e.target.src;
    });
    image.addEventListener('click', (e) => {
        document.getElementById('main-image').src = e.target.src;
    });
});