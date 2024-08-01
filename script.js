let hr = (new Date()).getHours();
const helloText = document.getElementById('welcome');
if (hr < 12) {
    helloText.innerHTML = 'A very Good Morning';
} else if (hr < 18) {
    helloText.innerHTML = 'A very Good Afternoon';
} else {
    helloText.innerHTML = 'A very Good Evening';
}
helloText.innerHTML += ', Welcome to my website!';

window.addEventListener('resize', () => {
    console.log('test')
    if (window.innerWidth < 500) {
        document.getElementById('MyOwnProjects').height = '1800px';
    } else {
        document.getElementById('MyOwnProjects').height = '450px';
    }
});