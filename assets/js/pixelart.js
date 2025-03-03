let art = document.getElementsByClassName("pixelart");

for (const el of art) {
    el.parentElement.style.setProperty("--natural-width", el.naturalWidth);
    el.parentElement.style.setProperty("--natural-height", el.naturalHeight);

}


// sets the device pixel ratio css var
function setPixelRatioCSS() {
    document.documentElement.style.setProperty('--device-pixel-ratio', window.devicePixelRatio);
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
