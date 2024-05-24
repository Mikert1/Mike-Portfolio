let hr = (new Date()).getHours();
const helloText = document.getElementById('welcome');
if (hr < 12) {
    helloText.innerHTML = 'A very Good Evening';
} else if (hr < 18) {
    helloText.innerHTML = 'A very Good Morning';
} else {
    helloText.innerHTML = 'A very Good Afternoon';
}