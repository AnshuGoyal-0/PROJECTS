class Analyser {
  constructor(
    audio,
    smoothTime,
    color,
    scale,
    min,
    max,
    offset,
    radius,
    isAlpha
  ) {
    this.audio = audio;
    this.visual = this.audio.visual;
    this.scale = scale;
    this.radius = radius;
    this.isAlpha = isAlpha;
    this.color = color;
    this.audioContext = this.audio.audioContext;
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.frequencyNum = 1024;
    this.hz = 22028;
    this.analyser.smoothingTimeConstant = smoothTime;
    this.filterLP = this.audioContext.createBiquadFilter();
    this.filterHP = this.audioContext.createBiquadFilter();
    this.filterLP.type = "lowpass";
    this.filterLP.frequency.value = max;
    this.maxHz = max;
    this.minHz = min;
    this.offset = offset;
    this.radiusOffset = 16 * this.offset;
    this.count = 0;
    this.stockSpectrums = [];
    this.sourceStart = Math.ceil((this.frequencyNum * this.minHz) / this.hz);
    this.sourceEnd = Math.round((this.frequencyNum * this.maxHz) / this.hz);
    this.sourceLength = this.sourceEnd - this.sourceStart + 1;
    this.adjustOffset = Math.round(this.sourceLength * 0.15);
    this.distLength = 120;
    this.interval = (this.sourceLength - 1) / (this.distLength - 1);
    this.totalLength = Math.round((this.distLength * 3) / 2);
  }
  adjustFrequency(i, avr) {
    var f =
      Math.max(0, this.spectrums[this.sourceStart + i] - avr) * this.scale;
    var offset = i - this.sourceStart;
    var ratio = offset / this.adjustOffset;
    f *= Math.max(
      0,
      Math.min(1, (5 / 6) * (ratio - 1) * (ratio - 1) * (ratio - 1) + 1)
    );
    return f;
  }
  update() {
    var spectrums = new Float32Array(this.frequencyNum);
    if (this.audio.isReady) {
      this.analyser.getFloatFrequencyData(spectrums);
      this.stockSpectrums.push(spectrums);
    }
    if (this.count < this.offset) {
      this.spectrums = new Float32Array(this.frequencyNum);
    } else {
      if (this.audio.isReady) {
        var _spectrums = this.stockSpectrums[0];
        if (!isFinite(_spectrums[0])) {
          this.spectrums = new Float32Array(this.frequencyNum);
        } else {
          this.spectrums = _spectrums;
        }
        this.stockSpectrums.shift();
      } else {
        this.spectrums = new Float32Array(this.frequencyNum);
      }
    }
    if (this.audio.isReady) {
      this.count++;
    }
    var canvasContext = this.visual.canvasContext;
    canvasContext.strokeStyle = this.color;
    canvasContext.fillStyle = this.color;
    var avr = 0;
    for (var i = this.sourceStart; i <= this.sourceEnd; i++) {
      avr += this.spectrums[i];
    }
    avr /= this.sourceLength;
    avr =
      !this.audio.isReady || avr === 0
        ? avr
        : Math.min(-40, Math.max(avr, -60));
    canvasContext.beginPath();
    var frequencyArray = [];
    for (var i = 0; i < this.distLength; i++) {
      var n1 = Math.floor(i * this.interval);
      var n2 = n1 + 1;
      var n0 = Math.abs(n1 - 1);
      var n3 = n1 + 2;
      n2 = n2 > this.sourceLength - 1 ? (this.sourceLength - 1) * 2 - n2 : n2;
      n3 = n3 > this.sourceLength - 1 ? (this.sourceLength - 1) * 2 - n3 : n3;
      var p0 = this.adjustFrequency(n0, avr);
      var p1 = this.adjustFrequency(n1, avr);
      var p2 = this.adjustFrequency(n2, avr);
      var p3 = this.adjustFrequency(n3, avr);
      var mu = i * this.interval - n1;
      var mu2 = mu * mu;
      var a0 = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
      var a1 = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
      var a2 = -0.5 * p0 + 0.5 * p2;
      var targetFrequency = a0 * mu * mu2 + a1 * mu2 + a2 * mu + p1;
      targetFrequency = Math.max(0, targetFrequency);
      frequencyArray.push(targetFrequency);
      var pos = this.visual.calculatePolarCoord(
        (i + this.visual.tick + this.offset) / (this.totalLength - 1),
        this.radius + targetFrequency + 3
      );
      canvasContext.lineTo(
        pos.x + this.radiusOffset,
        pos.y + this.radiusOffset
      );
    }
    for (var i = 1; i <= this.distLength; i++) {
      var targetFrequency = frequencyArray[this.distLength - i];
      var pos = this.visual.calculatePolarCoord(
        (i / 2 + this.distLength - 1 + this.visual.tick + this.offset) /
          (this.totalLength - 1),
        this.radius + targetFrequency + 3
      );
      canvasContext.lineTo(
        pos.x + this.radiusOffset,
        pos.y + this.radiusOffset
      );
    }
    for (var i = this.distLength; i > 0; i--) {
      var targetFrequency = frequencyArray[this.distLength - i];
      var pos = this.visual.calculatePolarCoord(
        (i / 2 + this.distLength - 1 + this.visual.tick + this.offset) /
          (this.totalLength - 1),
        this.radius - targetFrequency - 3
      );
      canvasContext.lineTo(
        pos.x + this.radiusOffset,
        pos.y + this.radiusOffset
      );
    }
    for (var i = this.distLength - 1; i >= 0; i--) {
      var targetFrequency = frequencyArray[i];
      var pos = this.visual.calculatePolarCoord(
        (i + this.visual.tick + this.offset) / (this.totalLength - 1),
        this.radius - targetFrequency - 3
      );
      canvasContext.lineTo(
        pos.x + this.radiusOffset,
        pos.y + this.radiusOffset
      );
    }
    canvasContext.fill();
  }
}

class Audio {
  constructor(_visual) {
    this.visual = _visual;
    this.audioContext = window.AudioContext
      ? new AudioContext()
      : new webkitAudioContext();
    this.fileReader = new FileReader();
    this.isReady = false;
    this.count = 0;
  }
  init() {
    this.analyser_1 = new Analyser(
      this,
      0.75,
      "#99ccff",
      5,
      1,
      600,
      3,
      450,
      true
    );
    this.analyser_2 = new Analyser(
      this,
      0.67,
      "#1a8cff",
      4.5,
      1,
      600,
      2,
      450,
      false
    );
    this.analyser_3 = new Analyser(
      this,
      0.5,
      "#0059b3",
      4,
      1,
      600,
      1,
      450,
      true
    );
    this.analyser_4 = new Analyser(
      this,
      0.33,
      "#00264d",
      3.5,
      1,
      600,
      0,
      450,
      false
    );
    this.render();
    document.getElementById("choose-file").addEventListener(
      "change",
      function (e) {
        this.fileReader.readAsArrayBuffer(e.target.files[0]);
      }.bind(this)
    );
    var _this = this;
    this.fileReader.onload = function () {
      _this.audioContext.decodeAudioData(
        _this.fileReader.result,
        function (buffer) {
          if (_this.source) {
            _this.source.stop();
          }
          _this.source = _this.audioContext.createBufferSource();
          _this.source.buffer = buffer;
          _this.source.loop = false;
          _this.connectNode(buffer);
          _this.isReady = true;
        }
      );
    };
  }
  connectNode(buffer) {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = false;
    this.source.connect(this.analyser_1.analyser);
    this.source.connect(this.analyser_2.analyser);
    this.source.connect(this.analyser_3.analyser);
    this.source.connect(this.analyser_4.analyser);
    this.source.connect(this.audioContext.destination);
    this.source.start(0);
  }
  render() {
    this.visual.draw();
    requestAnimationFrame(this.render.bind(this));
  }
}

class Visualizer {
  constructor() {
    this.canvas = document.getElementById("visualizer");
    this.canvasContext = this.canvas.getContext("2d");
    this.resize();
    this.circleR = 450;
    this.audio = new Audio(this);
    this.audio.init();
    this.tick = 0;
  }
  resize() {
    this.canvasW = this.canvas.width = window.innerWidth * 2;
    this.canvasH = this.canvas.height = window.innerHeight * 2;
  }
  calculatePolarCoord(a, b) {
    var x = Math.cos(a * 2 * Math.PI) * b;
    var y = Math.sin(a * 2 * Math.PI) * b * 0.95;
    return { x: x, y: y };
  }
  draw() {
    this.tick += 0.075;
    var canvasContext = this.canvasContext;
    canvasContext.save();
    canvasContext.clearRect(0, 0, this.canvasW, this.canvasH);
    canvasContext.translate(this.canvasW / 2, this.canvasH / 2);
    canvasContext.lineWidth = 3;
    this.audio.analyser_1.update();
    this.audio.analyser_2.update();
    this.audio.analyser_3.update();
    this.audio.analyser_4.update();
    canvasContext.restore();
  }
}

// Selecting all required elements
const wrapper = document.querySelector(".wrapper"),
  toast = wrapper.querySelector(".toast"),
  title = toast.querySelector("span"),
  subTitle = toast.querySelector("p"),
  wifiIcon = toast.querySelector(".icon"),
  closeIcon = toast.querySelector(".close-icon");

window.onload = () => {
  const visualizer = new Visualizer();
  window.onresize = () => {
    visualizer.resize();
  };

  function ajax() {
    let xhr = new XMLHttpRequest(); //creating new XML object
    xhr.open("GET", "https://jsonplaceholder.typicode.com/posts", true); //sending get request on this URL
    xhr.onload = () => {
      //once ajax loaded
      //if ajax status is equal to 200 or less than 300 that mean user is getting data from that provided url
      //or his/her response status is 200 that means he/she is online
      if (xhr.status == 200 && xhr.status < 300) {
        toast.classList.remove("offline");
        title.innerText = "You're online now";
        subTitle.innerText = "Hurray! Internet is connected.";
        wifiIcon.innerHTML = '<i class="uil uil-wifi"></i>';
        closeIcon.onclick = () => {
          //hide toast notification on close icon click
          wrapper.classList.add("hide");
        };
        setTimeout(() => {
          //hide the toast notification automatically after 5 seconds
          wrapper.classList.add("hide");
        }, 5000);
      } else {
        offline(); //calling offline function if ajax status is not equal to 200 or not less that 300
      }
    };
    xhr.onerror = () => {
      offline();
    };
    xhr.send();
  }

  function offline() {
    //function for offline
    wrapper.classList.remove("hide");
    toast.classList.add("offline");
    title.innerText = "You're offline now";
    subTitle.innerText = "Opps! Internet is disconnected.";
    wifiIcon.innerHTML = '<i class="uil uil-wifi-slash"></i>';
  }

  setInterval(() => {
    //this setInterval function call ajax frequently after 100ms
    ajax();
  }, 1000);
};
var input = document.querySelector(".search-form");
var search = document.querySelector("input");
var button = document.querySelector(".input");
button.addEventListener("click", function (e) {
  e.preventDefault();
  input.classList.toggle("active");
});
search.addEventListener("focus", function () {
  input.classList.add("focus");
});

search.addEventListener("blur", function () {
  search.value.length != 0
    ? input.classList.add("focus")
    : input.classList.remove("focus");
});

const timeElement = document.querySelector(".time");
const dateElement = document.querySelector(".date");

/**
 * @param {Date} date
 */
function formatTime(date) {
  const hours12 = date.getHours() % 12 || 12;
  const minutes = date.getMinutes();
  const isAm = date.getHours() < 12;

  return `${hours12.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${isAm ? "AM" : "PM"}`;
}

/**
 * @param {Date} date
 */
function formatDate(date) {
  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${DAYS[date.getDay()]}<br>${
    MONTHS[date.getMonth()]
  } ${date.getDate()} ${date.getFullYear()}`;
}

// Get the current date and time
const currentDate = new Date();

// Format and set the date
dateElement.innerHTML = formatDate(currentDate);

// Format and set the time
timeElement.innerHTML = formatTime(currentDate);
let card = document.querySelector(".card");

document.addEventListener("mousemove", function (e) {
  let xAxis = (window.innerWidth / 2 - e.pageX) / 20;
  let yAxis = (window.innerHeight / 2 - e.pageY) / 20;
  card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});
class AudioVisualizer {
  constructor(audioContext, processFrame, processError) {
    this.audioContext = audioContext;
    this.processFrame = processFrame;
    this.connectStream = this.connectStream.bind(this);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(this.connectStream)
      .catch((error) => {
        if (processError) {
          processError(error);
        }
      });
  }

  connectStream(stream) {
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(stream);
    console.log(source);
    source.connect(this.analyser);
    this.analyser.smoothingTimeConstant = 0.5;
    this.analyser.fftSize = 32;

    this.initRenderLoop(this.analyser);
  }

  initRenderLoop() {
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const processFrame = this.processFrame || (() => {});

    const renderFrame = () => {
      this.analyser.getByteFrequencyData(frequencyData);
      processFrame(frequencyData);

      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
  }
}

const visualMainElement = document.querySelector("main");
const visualValueCount = 16;
let visualElements;
const createDOMElements = () => {
  let i;
  for (i = 0; i < visualValueCount; ++i) {
    const elm = document.createElement("div");
    visualMainElement.appendChild(elm);
  }

  visualElements = document.querySelectorAll("main div");
};
createDOMElements();

const startTranscriptions = () => {
  const recognition = new window.webkitSpeechRecognition(); // Create a new speech recognition instance
  recognition.continuous = true; // Enable continuous speech recognition
  recognition.lang = "en-US"; // Set the language for speech recognition (change as needed)

  // Event handler for when speech is recognized
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    // Display the recognized text (you can modify this part as needed)
    let doc = document.getElementById("output");
    doc.innerHTML = transcript;
    update3DElements(transcript);
  };

  // Event handler for errors during speech recognition
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  // Start speech recognition
  recognition.start();

  // Stop speech recognition after a certain duration (optional)
  // setTimeout(() => {
  //   recognition.stop();
  // }, 5000); // Stop after 5 seconds (adjust the duration as needed)
};
const update3DElements = (text) => {
  // Example: Update the 3D visualization based on the recognized text
  // For demonstration purposes, let's assume there's a function called 'updateVisualization' that updates the 3D visualization based on the text
  updateVisualization(text);
};

// Function to update the 3D visualization
const updateVisualization = (text) => {
  // Example: Update the 3D visualization based on the recognized text
  // You can implement the logic here to modify the 3D elements according to the recognized text
  console.log("Recognized text:", text);
  // Example: Change the color of the 3D elements based on the recognized text
  const color = text.includes("red") ? "red" : "blue";
  // Example: Update the color of the 3D elements
  updateColor(color);

  // Update the content of the <p> tag inside the .card-content div
  const cardContent = document.querySelector(".card-content p");
  if (cardContent) {
    cardContent.textContent = text;
  }
};

// Function to update the color of the 3D elements
const updateColor = (color) => {
  // Example: Update the color of the 3D elements based on the recognized text
  // You can implement the logic here to change the color of the 3D elements
  // For demonstration purposes, let's assume there's a variable called 'visualElements' that contains references to the 3D elements
  // You would replace this with your actual code to update the 3D elements
  visualElements.forEach((element) => {
    element.style.color = color;
  });
};

// Example function to change the color of the 3D elements
const changeColor = (color) => {
  // Example: Change the color of the 3D elements based on the recognized text
  // You can implement the logic here to actually change the color of the 3D elements in your visualization
  // For demonstration purposes, let's assume there's a function called 'changeColor' that updates the color of the 3D elements
  changeColor(color);
};

// Initialize the 3D visualization and speech recognition integration

const init = () => {
  // Creating initial DOM elements
  const audioContext = new AudioContext();
  const initDOM = () => {
    visualMainElement.innerHTML = "";
    createDOMElements();
  };
  initDOM();

  // Swapping values around for a better visual effect
  const dataMap = {
    0: 15,
    1: 10,
    2: 8,
    3: 9,
    4: 6,
    5: 5,
    6: 2,
    7: 1,
    8: 0,
    9: 4,
    10: 3,
    11: 7,
    12: 11,
    13: 12,
    14: 13,
    15: 14,
  };
  const processFrame = (data) => {
    const values = Object.values(data);
    let i;
    for (i = 0; i < visualValueCount; ++i) {
      const value = values[dataMap[i]] / 255;
      const elmStyles = visualElements[i].style;
      elmStyles.transform = `scaleY( ${value} )`;
      elmStyles.opacity = Math.max(0.25, value);
    }
  };

  const processError = () => {
    visualMainElement.classList.add("error");
    visualMainElement.innerText =
      "Please allow access to your microphone in order to see this demo.\nNothing bad is going to happen... hopefully :P";
  };

  const a = new AudioVisualizer(audioContext, processFrame, processError);

  startTranscriptions();
};
