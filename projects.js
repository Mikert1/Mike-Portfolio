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
const mainImage = document.getElementById('main-image');
const image1 = document.getElementById('image1');
const image2 = document.getElementById('image2');
const image3 = document.getElementById('image3');
const image4 = document.getElementById('image4');
const image5 = document.getElementById('image5');
const buttons = document.getElementById('buttons');

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
        for (let i = 0; i < data[params.id].images.length; i++) {
            const div = document.createElement('div');
            let img = document.createElement('img');
            img.src = data[params.id].images[i];
            img.alt = data[params.id].name;
            img.id = `image${i + 1}`;
            div.appendChild(img);
            document.querySelector('.sub-images').appendChild(div);
            document.title = "Mikert.com | " + data[params.id].name;
        }
        mainImage.src = data[params.id].images[0];
        if (data[params.id].type === 'Game') {
            const download = document.createElement('img');
            download.src = 'assets/img/buttons/download.png';
            download.addEventListener('click', () => {
                window.open(data[params.id].releases);
            });
            buttons.appendChild(download);
            version.innerHTML = version.innerHTML + '<p>' + data[params.id].versionPrefix + data[params.id].version + '<span>' + data[params.id].versionSuffix + '</span> </p>';
        } else if (data[params.id].type === 'Website') {
            const link = document.createElement('img');
            link.src = 'assets/img/buttons/visit.png';
            link.addEventListener('click', () => {
                window.open(data[params.id].link);
            });
            buttons.appendChild(link);
            version.innerHTML = ""
        }
        const source = document.createElement('img');
        source.src = 'assets/img/buttons/github.png';
        source.addEventListener('click', () => {
            window.open(data[params.id].repository);
        });
        buttons.appendChild(source);
    })
    .then(() => {
        const subImages = document.querySelectorAll('.sub-images div img');
        subImages.forEach((image) => {
            image.addEventListener('mouseover', (e) => {
                document.getElementById('main-image').src = e.target.src;
            });
            image.addEventListener('click', (e) => {
                document.getElementById('main-image').src = e.target.src;
            });
        });
    });