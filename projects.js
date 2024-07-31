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
                if (data[params.id].platforms[i] === 'windows') {
                    platforms.innerHTML = platforms.innerHTML + `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-windows" viewBox="0 0 16 16">
                        <path d="M6.555 1.375 0 2.237v5.45h6.555zM0 13.795l6.555.933V8.313H0zm7.278-5.4.026 6.378L16 16V8.395zM16 0 7.33 1.244v6.414H16z"/>
                    </svg>`;
                } else if (data[params.id].platforms[i] === 'mac') {
                    platforms.innerHTML = platforms.innerHTML + `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-apple" viewBox="0 0 16 16">
                        <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
                        <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
                    </svg>`;
                } else if (data[params.id].platforms[i] === 'linux') {
                    platforms.innerHTML = platforms.innerHTML + `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-linux" viewBox="0 0 16 16">
                        <path d="M8 0a8 8 0 0 1 6.485 12.955l-1.75-1.02A6 6 0 1 0 2.045 2.045L3.765 3.07A8 8 0 0 1 8 0zm-4.5 3.5a6 6 0 0 1 9.5-2.5l1.75 1.02A8 8 0 0 0 8 1V14a6 6 0 0 1-4.5-10.5z"/>
                    </svg>`;
                }
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
            version.innerHTML = version.innerHTML + '<p>' + data[params.id].versionPrefix + '<span>' + data[params.id].version + '</span>' + data[params.id].versionSuffix + '</p>';
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
            image.addEventListener('click', (e) => {
                document.getElementById('main-image').src = e.target.src;
            });
        });
    });