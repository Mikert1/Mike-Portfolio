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