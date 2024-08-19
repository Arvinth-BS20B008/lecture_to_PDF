// Utility function to remove an element from the DOM
// Usage <element onfoo="removeElement(this)" />
// DO NOT DELETE: This is in use
function removeElement(element) {
  element.remove();
}

// Main functionality
(function () {
  const getById = (id) => document.getElementById(id);

  // TODO: Handle screen resizing gracefully during screen sharing
  let videoWidth = 640; // Width to scale each captured screenshot
  let videoHeight = 0;  // Height determined by aspect ratio of the screenshot

  let isStreaming = false;  // Check if streaming is active

  // Global variables, initialized after HTML loads
  let controlDiv = null;  // Div holding screen sharing controls

  let screenVideo = null;  // Video element showing the shared screen
  let screenshotInterval = null;  // Interval ID for auto-capture screenshots
  let screenshotDelay = 500;  // Interval (ms) between auto screenshots
  // TODO: Display auto-capture status and delay in HTML

  let discardSimilar = true;

  let captureCanvas = null;  // Off-screen canvas for capturing images
  let previousImageData = null;  // Holds the previous screenshot's ImageData
  let previousImageURL = null;
  let defaultBackgroundColor = Uint8ClampedArray.from([255, 255, 255, 255]);  // TODO: Initialize properly

  let screenshotOutput = null;  // Div for displaying captured screenshots
  let pageTitle = null;  // Editable page title element

  // Function to compare images and detect changes
  function isNewSlide(currentImage, previousImage, backgroundColor) {
    if (!currentImage) return false;
    if (!previousImage) return true;
    if (currentImage.width !== previousImage.width || currentImage.height !== previousImage.height) return false;

    function hasAnnotation(imageData, prevImageData, bgColor, changeThreshold = 0.002, annotationThreshold = 0.5, colorThreshold = 1000) {
      function getColorDifference(pixel1, pixel2, offset1 = 0, offset2 = 0) {
        return pixel1.slice(offset1, offset1 + 4).reduce((diff, color, i) => diff + (color - pixel2[offset2 + i]) ** 2, 0);
      }

      let changedPixels = 0;
      let annotatedPixels = 0;
      const totalPixels = imageData.width * imageData.height;

      for (let i = 0; i < totalPixels * 4; i += 4) {
        if (getColorDifference(imageData.data, prevImageData.data, i) > colorThreshold) {
          changedPixels++;
          if (getColorDifference(prevImageData.data, bgColor, i) > colorThreshold) annotatedPixels++;
        }
      }

      const unAnnotatedChanges = changedPixels - annotatedPixels;

      console.log((changedPixels / totalPixels) * 1000, (annotatedPixels / changedPixels) * 100,
        changedPixels <= changeThreshold * totalPixels || annotatedPixels >= annotationThreshold * changedPixels);

      getById('bar_1').style.height = `${Math.ceil(1000 * changedPixels / totalPixels)}%`;
      getById('bar_1').innerText = `${Math.ceil(1000 * changedPixels / totalPixels)}%`;
      getById('bar_2').style.height = `${Math.ceil(1000 * unAnnotatedChanges / totalPixels)}%`;
      getById('bar_2').innerText = `${Math.ceil(1000 * unAnnotatedChanges / totalPixels)}%`;
      getById('bar_3').style.height = `${Math.ceil((100 * unAnnotatedChanges) / changedPixels)}%`;
      getById('bar_3').innerText = `${Math.ceil((100 * unAnnotatedChanges) / changedPixels)}%`;

      return changedPixels <= changeThreshold * totalPixels || annotatedPixels >= annotationThreshold * changedPixels;
    }

    return !hasAnnotation(currentImage, previousImage, backgroundColor);
  }

  // Capture a screenshot and append it to the output div
  function captureScreenshot(saveAll = false) {
    const context = captureCanvas.getContext('2d');
    if (videoWidth && videoHeight) {
      captureCanvas.width = videoWidth;
      captureCanvas.height = videoHeight;
      context.drawImage(screenVideo, 0, 0, videoWidth, videoHeight);
      const currentImageData = context.getImageData(0, 0, captureCanvas.width, captureCanvas.height);

      if (previousImageURL && (saveAll || isNewSlide(currentImageData, previousImageData, defaultBackgroundColor))) {
        console.log("Capturing screenshot!");

        const imgElement = document.createElement('img');
        imgElement.className = "screenshot";
        imgElement.src = previousImageURL;
        imgElement.setAttribute('onauxclick', 'removeElement(this)');
        screenshotOutput.appendChild(imgElement);

        defaultBackgroundColor = getBackgroundColor(currentImageData);
      }
      previousImageURL = captureCanvas.toDataURL('image/png');
      previousImageData = currentImageData;
    }
  }

  // Placeholder function to determine the background color of an image
  function getBackgroundColor(imageData) {
    // TODO: Implement the actual background color detection
    return [255, 255, 255, 255];
  }

  // Initialize the app and set up event listeners
  function initApp() {
    controlDiv = getById('screen_share_controls');
    getById('start_button').onclick = startScreenShare;

    screenVideo = getById('video');
    getById('click_button').onclick = () => captureScreenshot(true);
    getById('auto_click').onclick = function () {
      if (!screenshotInterval) {
        screenshotInterval = setInterval(() => captureScreenshot(!discardSimilar), screenshotDelay);
        getById("auto_click_status").innerText = "ON";
        getById("auto_click_interval").innerText = screenshotDelay;
      } else {
        clearInterval(screenshotInterval);
        screenshotInterval = null;
        getById("auto_click_status").innerText = "OFF";
        getById("auto_click_interval").innerText = screenshotDelay;
      }
    }

    // TODO: Rename and add status indicator
    getById('discard_similar_slides').onclick = function () {
      discardSimilar = !discardSimilar;
    }

    getById('stop_button').onclick = function () {
      const tracks = screenVideo.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      screenVideo.srcObject = null;
      captureScreenshot(false);
      controlDiv.remove();
    }

    captureCanvas = getById('canvas');
    screenshotOutput = getById('output');

    // Allow page title editing
    pageTitle = getById('title');
    pageTitle.onblur = function () {
      document.title = pageTitle.innerText;
    }
  }

  // Start screen sharing, called on button click
  function startScreenShare() {
    videoWidth = controlDiv.clientWidth * 0.9;

    navigator.mediaDevices.getDisplayMedia()
      .then(function (stream) {
        screenVideo.srcObject = stream;
        screenVideo.play();
        console.log("Screen sharing started with stream " + stream.id);
      })
      .catch(function (err) {
        console.log("Error occurred: " + err);
      });

    screenVideo.addEventListener('canplay', function () {
      if (!isStreaming) {
        videoHeight = screenVideo.videoHeight / (screenVideo.videoWidth / videoWidth);

        if (isNaN(videoHeight)) {
          videoHeight = videoWidth / (4 / 3);
        }

        screenVideo.width = videoWidth;
        screenVideo.height = videoHeight;
        screenVideo.controls = false;
        captureCanvas.width = videoWidth;
        captureCanvas.height = videoHeight;
        isStreaming = true;
      }
    }, false);
  }

  // Initialize on window load
  window.addEventListener('load', initApp, false);
})();
