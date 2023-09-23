'use strict';
import DID_API from '../api.json' assert { type: 'json' };
import CUSTOM from './custom.json' assert { type: 'json' };

if (DID_API.key == '🤫') alert('Please put your api key inside ./api.json and restart..');

const RTCPeerConnection = (
  window.RTCPeerConnection ||
  window.webkitRTCPeerConnection ||
  window.mozRTCPeerConnection
).bind(window);

let conversationId = null;

let recognized;
let recognition;
let recognitionState = false;

let aiResponseGlobal;

const idleUrl = CUSTOM.idle_url;

const talkVideo = document.getElementById('talk-video');
const talkVideoStream = document.getElementById('talk-video-stream');
const contentDiv = document.getElementById('content');

// Handle mobile keyboard issue
const speechInput = document.getElementById('speech');
speechInput.addEventListener('focus', () => {
  contentDiv.style.transform = 'translateY(-50%)'; // Adjust this value as needed
});
speechInput.addEventListener('blur', () => {
  contentDiv.style.transform = 'translateY(0)';
});

talkVideoStream.addEventListener('ended', () => {
  console.log('Ended');
  playIdleVideo();
});

const say = async (input = 'Heavy Metal') => {
  try {
    const talkResponse = await fetchWithRetries(`${DID_API.url}/animations/v3/generate_lipsync`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${DID_API.key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text: input,
        idle_url: idleUrl,
        azure_voice: CUSTOM.voice,
      })
    });

    const videoBlob = await talkResponse.blob();
    const videoURL = URL.createObjectURL(videoBlob);

    if (input) {
      helpMessageInner.innerHTML += `<p style="color: #14C6F1; width: 75%;">${input}</p>`;
      helpMessageInner.scrollTo({top: 99999, behavior: 'smooth'});
    }

    setVideoElement(videoURL)
  }
  catch(error) {
    console.log(error);
  }
};

const chatButton = document.getElementById('chat-button');
const conversation = document.getElementById('speech');
const microphoneIcon = document.getElementsByClassName('fa-microphone')[0];
const sendIcon = document.getElementsByClassName('paper-plane')[0];

conversation.addEventListener('input', (event) => {
  if (event.target.value.length > 0) {
    recognitionState = true;

    sendIcon.style.display = 'block';
    microphoneIcon.style.display = 'none';
  }
  else {
    recognitionState = false;
    sendIcon.style.display = 'none';
    microphoneIcon.style.display = 'block';
  };
});

const helpMessageInner = document.getElementById('help-message-inner');
chatButton.onclick = async () => {
  recognitionState = !recognitionState;

  if (recognitionState) {
    if (recognition) recognition.start();

    sendIcon.style.display = 'block';
    microphoneIcon.style.display = 'none';
  }
  else {
    sendIcon.style.display = 'none';
    microphoneIcon.style.display = 'block';
  }

  if (conversation.value.length > 0) {
    recognized = true;
    recognitionState = false;
  } else {
    await recognize();
    recognized = true;
    recognitionState = false;

    sendIcon.style.display = 'none';
    microphoneIcon.style.display = 'block';
  }

  if (recognized) {
    if (recognition) recognition.stop();
  }

  var raw = conversation.value;
  helpMessageInner.innerHTML += `<p class="align-self-end" style="text-align: left; color: black; width: 75%;">${raw}</p>`;
  helpMessageInner.scrollTo({top: 99999, behavior: 'smooth'});

  if (!recognitionState) {
    ask(raw);
    conversation.value = '';
  }
};

async function recognize() {
  return new Promise(async (resolve, reject) => {
    recognitionState = true;

    await getLocalStream();

    recognition = recognitionFactory();

    recognition.lang = CUSTOM.recognition_lang;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = function (event) {
      const transcript = event.results[event.results.length - 1][0].transcript;

      conversation.value = transcript;

      console.log('Recognized speech:', transcript);
      resolve(transcript);
    };

    recognition.onend = function () {
      console.log('Speech recognition ended.');
    };
  });
}

async function getLocalStream() {
  await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
}

const recognitionFactory = () => {
  const detectedBrowser = detectBrowser();

  switch (detectedBrowser) {
    case 'Google Chrome':
      return new webkitSpeechRecognition();
    default:
      return new SpeechRecognition();
  }
};

function ask(raw) {
  // ... [rest of the ask function remains unchanged]
}

function setVideoElement(videoUrl) {
  talkVideo.classList.remove('item-fade');
  talkVideo.classList.add('item-fade-out');

  talkVideoStream.classList.remove('item-fade-out');
  talkVideoStream.classList.add('item-fade');

  talkVideoStream.style.zIndex = 3;

  if (!videoUrl) return;
  talkVideoStream.src = videoUrl;
  talkVideoStream.loop = false;

  if (talkVideo.paused) {
    talkVideo
      .play()
      .then((_) => {})
      .catch((e) => {});
  }
}

function playIdleVideo() {
  talkVideo.classList.remove('item-fade-out');
  talkVideo.classList.add('item-fade');

  talkVideoStream.classList.remove('item-fade');
  talkVideoStream.classList.add('item-fade-out');

  talkVideoStream.style.zIndex = 1;

  talkVideo.srcObject = undefined;
  talkVideo.src = CUSTOM.video;
  talkVideo.loop = true;
}

const maxRetryCount = 3;
const maxDelaySec = 4;

async function fetchWithRetries(url, options, retries = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries <= maxRetryCount) {
      const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;

      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
      return fetchWithRetries(url, options, retries + 1);
    } else {
      throw new Error(`Max retries exceeded. error: ${err}`);
    }
  }
}

function detectBrowser() {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";

  if (userAgent.indexOf("Chrome") !== -1) {
    browser = "Google Chrome";
  } else if (userAgent.indexOf("Firefox") !== -1) {
    browser = "Mozilla Firefox";
  } else if (userAgent.indexOf("Edge") !== -1) {
    browser = "Microsoft Edge";
  } else if (userAgent.indexOf("Safari") !== -1) {
    browser = "Apple Safari";
  } else if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) {
    browser = "Opera";
  } else if (userAgent.indexOf("Trident") !== -1) {
    browser = "Internet Explorer";
  }

  return browser;
}

function getToken() {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++)
  {
      result += chars[getRandomInt(16)];
  }
  return result
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
