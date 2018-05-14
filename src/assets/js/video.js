
function createControls() {

    videocontainer = document.querySelector('#videocontainer');
    media = document.querySelector('video');

    controls = document.querySelector('.controls');
    media.removeAttribute('controls');

    play = document.querySelector('.play');
    stop = document.querySelector('.stop');
    backward = document.querySelector('.backward');
    forward = document.querySelector('.forward');
    fullscreen = document.querySelector('.fullscreen');

    timerWrapper = document.querySelector('.timer');
    timer = document.querySelector('.timer span');

    play.addEventListener('click', playPauseMedia);
    stop.addEventListener('click', stopMedia);
    backward.addEventListener('click', mediaBackward);
    forward.addEventListener('click', mediaForward);
    fullscreen.addEventListener('click', fullScreen);
    media.addEventListener('timeupdate', setTime);
}

function playPauseMedia() {
    if (media.paused) {
        play.childNodes[0].nextSibling.setAttribute('shape', 'pause');
        media.play();
    } else {
        play.childNodes[0].nextSibling.setAttribute('shape', 'play');
        media.pause();
    }
}

function stopMedia() {
    media.pause();
    media.currentTime = 0;
    play.childNodes[0].nextSibling.setAttribute('shape', 'play');
}

function mediaBackward() {
    media.currentTime -= 3;
}

function mediaForward() {
    if (media.currentTime >= media.duration - 3) {
        stopMedia();
    } else {
        media.currentTime += 3;
    }
}

function fullScreen() {
    fullscreen.childNodes[0].nextSibling.setAttribute('shape', 'resize-down');
    if (videocontainer.requestFullscreen) {
        videocontainer.requestFullscreen();
    } else if (media.mozRequestFullScreen) {
        videocontainer.mozRequestFullScreen();
    } else if (media.webkitRequestFullscreen) {
        videocontainer.webkitRequestFullscreen();
    }
}

function setTime() {
    var minutes = Math.floor(media.currentTime / 60);
    var seconds = Math.floor(media.currentTime - minutes * 60);
    var minuteValue;
    var secondValue;

    if (minutes < 10) {
        minuteValue = '0' + minutes;
    } else {
        minuteValue = minutes;
    }

    if (seconds < 10) {
        secondValue = '0' + seconds;
    } else {
        secondValue = seconds;
    }

    var mediaTime = minuteValue + ':' + secondValue;
    timer.textContent = mediaTime;

    timerWrapper.clientWidth * (media.currentTime / media.duration);
}