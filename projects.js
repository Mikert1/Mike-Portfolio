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
const date = document.getElementById('date');
const lang = document.getElementById('lang');
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
                fetch(`assets/img/svg/${data[params.id].platforms[i]}.svg`)
                .then(response => response.text())
                .then(data => {
                    const div = document.createElement('div');
                    div.innerHTML = data;
                    platforms.appendChild(div);
                });
            }
        }
        date.textContent = data[params.id].date;
        lang.innerHTML = lang.innerHTML + data[params.id].lang;
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
            const download = document.getElementById('mainButton');
            let osName = window.navigator.platform;
            if (osName.includes('Win')) {
                osName = 'assets/img/svg/windows.svg';
            } else if (osName.includes('Mac')) {
                osName = 'assets/img/svg/mac.svg';
            } else if (osName.includes('Linux')) {
                osName = 'assets/img/svg/linux.svg';
            } else {
                osName = 'assets/img/svg/download.svg';
            }
            fetch(osName)
                .then(response => response.text())
                .then(data => {
                    const svg = document.getElementById('svg');
                    svg.innerHTML = data;
                });
            download.querySelector('h2').innerHTML = 'Download';
            download.href = data[params.id].releases;
            version.innerHTML = version.innerHTML + '<p>' + data[params.id].versionPrefix + '<span>' + data[params.id].version + '</span>' + data[params.id].versionSuffix + '</p>';
        } else if (data[params.id].type === 'Website') {
            const link = document.getElementById('mainButton');
            link.querySelector('h2').innerHTML = 'Visit Website';
            link.href = data[params.id].link;
            version.innerHTML = "";
            fetch('assets/img/svg/arrow.svg')
                .then(response => response.text())
                .then(data => {
                    const svg = document.getElementById('svg');
                    svg.innerHTML = data;
                });
        }
        const source = document.getElementById('source');
        source.href = data[params.id].repository;
    })
    .then(() => {
        const subImages = document.querySelectorAll('.sub-images div img');
        subImages.forEach((image) => {
            image.addEventListener('click', (e) => {
                document.getElementById('main-image').src = e.target.src;
            });
        });
    });