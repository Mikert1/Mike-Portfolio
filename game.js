subImages = document.querySelectorAll('.game-prefiew-image div img');
subImages.forEach((image) => {
    image.addEventListener('mouseover', (e) => {
        document.getElementById('main-image').src = e.target.src;
    });
    image.addEventListener('click', (e) => {
        document.getElementById('main-image').src = e.target.src;
    });
});