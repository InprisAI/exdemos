'use strict';
import DID_API from '../api.json' assert { type: 'json' };
import CUSTOM from './custom.json' assert { type: 'json' };

if (DID_API.key == '🤫') alert('Please put your api key inside ./api.json and restart..');

let conversationId = null;

let recognized;
let recognition;
let recognitionState = false;

// let aiResponseGlobal;
const chatWindow = document.getElementById('help-message-inner');

function applyQuestion() {
  const text = 'Send a message or press the microphone to talk';

  chatWindow.innerHTML = `<div class="d-flex mb-3">
  <div class="px-4">
    <img src="./bot.png" alt="bot_head" />
  </div>
  <p class="flex-grow-1" style="color: white;">${text}</p>
  <input id="hidden-element" type="text" class="d-none" value="${text}" />
  <div class="px-2">
    <img class="click-to-copy" src="./duplicate.svg" alt="copy" />
  </div>
</div>
`;
}

// const idleUrl = CUSTOM.idle_url;

// const talkVideo = document.getElementById('talk-video');
// const talkVideoStream = document.getElementById('talk-video-stream');

addEventListener('load', () => {
  // connect();
  applyQuestion();
})

const copy = document.getElementsByClassName('click-to-copy');

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('click-to-copy')) {
    const hidden = e.target.parentNode.previousSibling.previousSibling;
    hidden.select();
    /* Copy the text inside the text field */
    navigator.clipboard.writeText(hidden.value);  
  }
})

// async function connect() {
//   playIdleVideo();
// }

// talkVideoStream.addEventListener('ended', () => {
//   console.log('Ended');

//   playIdleVideo();
// });

// const say = async (input = 'Heavy Metal') => {
//   try {
//     const talkResponse = await fetchWithRetries(`${DID_API.url}/animations/v3/generate_lipsync`, {
//       method: 'POST',
//       headers: {
//         accept: 'application/json',
//         Authorization: `Bearer ${DID_API.key}`,
//         'content-type': 'application/json',
//       },
//       body: JSON.stringify({
//         text: input,
//         idle_url: idleUrl,
//         azure_voice: CUSTOM.voice,
//       })
//     });

//     const videoBlob = await talkResponse.blob();
//     // Create an Object URL for the Blob.
//     const videoURL = URL.createObjectURL(videoBlob);

//     if (input) {
//       helpMessageInner.innerHTML += `<p style="color: #14C6F1; width: 75%;">${input}</p>`;
//       helpMessageInner.scrollTo({top: 99999, behavior: 'smooth'});
//     }

//     setVideoElement(videoURL)
//   }
//   catch(error) {
//     console.log(error);
//   }
// };

// const talkButton = document.getElementById('talk-button');

const chatButton = document.getElementById('chat-button');
const chatForm = document.getElementById('chat-form');
const conversation = document.getElementById('speech');
const microphoneIcon = document.getElementsByClassName('fa-microphone')[0];
const sendIcon = document.getElementsByClassName('paper-plane')[0];
let clientId = CUSTOM.copilot;

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
chatForm.onsubmit = async (e) => {
  e.preventDefault();

  recognitionState = !recognitionState;
  // TODO: Refactor

  // If user entered text manually setting it that it was already recognized;
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

    // Refactor
    sendIcon.style.display = 'none';
    microphoneIcon.style.display = 'block';

  }

  if (recognized) {
    if (recognition) recognition.stop();
  }

  var raw = conversation.value;
  helpMessageInner.innerHTML += `<div class="d-flex mb-3 py-2" style="background-color: rgba(255, 255, 255, .2);">
    <div class="px-4">
                        <img src="./hyundai.png" alt="hyundai" />
                      </div><p style="color: white;">${raw}</p></div>`;
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

    recognition.lang = CUSTOM.recognition_lang; // Set language (e.g., US English)
    recognition.continuous = true; // Enable continuous recognition
    recognition.interimResults = false; // Get interim results as the user speaks

    recognition.start();

    recognition.onresult = function (event) {
      const transcript = event.results[event.results.length - 1][0].transcript;

      conversation.value = transcript;

      console.log('Recognized speech:', transcript);
      resolve(transcript);
    };

    recognition.onend = function () {
      console.log('Speech recognition ended.');
      // recognition.stop();
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
      return new webkitSpeechRecognition(); // Chrome
    default:
      return new SpeechRecognition(); // Firefox, Edge
  }
};

function ask(raw) {
  console.log('Asking...');
  // return;
  conversation.value = '';

  const myHeaders = {
    'CLIENT-ID': clientId,
    'Content-Type': 'text/plain',
  };

  if (conversationId) myHeaders['Conversation-Id'] = conversationId;

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch('https://chatwith.humains.com/bot', requestOptions)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      conversationId = response.headers.get('Conversation-Id');

      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const readableString = decoder.decode(buffer);
      return readableString;
    })
    .then((result) => {
      // say(result);
      helpMessageInner.innerHTML += `
      <div class="d-flex mb-3 py-2">
        <div class="px-4">
          <img src="./bot.png" alt="humain" />
        </div>
        <p class="flex-grow-1" style="color: white;">${result}</p>
        <input id="hidden-element" type="text" class="d-none" value="${result}" />
        <div class="px-2">
          <img class="click-to-copy" src="./duplicate.svg" alt="copy" />
        </div>
      </div>
`;
      helpMessageInner.scrollTo({top: 99999, behavior: 'smooth'});

      // aiResponseGlobal = result;
      console.log(result);
    })
    .catch((error) => console.log('error: ', error));
};

// function setVideoElement(videoUrl) {
//   talkVideo.classList.remove('item-fade');
//   talkVideo.classList.add('item-fade-out');

//   talkVideoStream.classList.remove('item-fade-out');
//   talkVideoStream.classList.add('item-fade');

//   talkVideoStream.style.zIndex = 3;

//   if (!videoUrl) return;
//   talkVideoStream.src = videoUrl;
//   talkVideoStream.loop = false;

//   // safari hotfix
//   if (talkVideo.paused) {
//     talkVideo
//       .play()
//       .then((_) => {})
//       .catch((e) => {});
//   }
// }

// function playIdleVideo() {
//   talkVideo.classList.remove('item-fade-out');
//   talkVideo.classList.add('item-fade');

//   talkVideoStream.classList.remove('item-fade');
//   talkVideoStream.classList.add('item-fade-out');

//   talkVideoStream.style.zIndex = 1;

//   talkVideo.srcObject = undefined;
//   talkVideo.src = CUSTOM.video;
//   talkVideo.loop = true;
// }

// const maxRetryCount = 3;
// const maxDelaySec = 4;

// async function fetchWithRetries(url, options, retries = 1) {
//   try {
//     return await fetch(url, options);
//   } catch (err) {
//     if (retries <= maxRetryCount) {
//       const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;

//       await new Promise((resolve) => setTimeout(resolve, delay));

//       console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
//       return fetchWithRetries(url, options, retries + 1);
//     } else {
//       throw new Error(`Max retries exceeded. error: ${err}`);
//     }
//   }
// }

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

function clearChat() {
  chatWindow.innerHTML = '';
}

let tool = document.getElementById('tool');
let toolDescription = document.getElementById('tool-description');








var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;

        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;

            tool.innerHTML = s.value;
            toolDescription.innerHTML = CUSTOM[s.value + 'Description'];
            clientId = CUSTOM[s.value.toLowerCase()]
            clearChat();
            applyQuestion();

            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);
