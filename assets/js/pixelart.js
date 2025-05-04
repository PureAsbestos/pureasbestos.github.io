let art = document.getElementsByClassName("pixelart");

function setNaturalDims(img) {
    img.parentElement.style.setProperty("--natural-width", img.naturalWidth);
    img.parentElement.style.setProperty("--natural-height", img.naturalHeight);
}


for (const el of art) {
    if (el.naturalWidth > 0 && el.naturalHeight > 0) {
        setNaturalDims(el);
    } else {
        el.onload = (() => {setNaturalDims(el);})
    }

}


// sets the device pixel ratio css var
function setPixelRatioCSS() {
    document.documentElement.style.setProperty('--device-pixel-ratio', window.visualViewport.scale * window.devicePixelRatio);
}
setPixelRatioCSS();

// add an event listener to detect when the DPR changes, and set the CSS var
function listenOnDevicePixelRatio() {
    function onChange() {
        setPixelRatioCSS();
        listenOnDevicePixelRatio();
    }
    matchMedia(
        `(resolution: ${window.devicePixelRatio}dppx)`
    ).addEventListener("change", onChange, { once: true });
}
listenOnDevicePixelRatio();


function visualViewportResized() {
    setPixelRatioCSS();
}
window.visualViewport.addEventListener('resize', visualViewportResized);