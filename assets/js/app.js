
function setAppStoreBtnLink() {
    const appStoreBtns = document.querySelectorAll(".qb-download-btn");
    appStoreBtns.forEach(btn=>{
        const playstoreLink = "https://play.google.com/store/apps/details?id=com.skellam.qffer";
        const iosStoreLink = "https://apps.apple.com/in/app/qffer/id6444561397";
        let redirectLink;
        let userAgent = window.navigator ? window.navigator.userAgent : null;
        if (userAgent && (/iPhone/.test(userAgent) || /iPad/.test(userAgent))) redirectLink = iosStoreLink;
        else redirectLink = playstoreLink;
        btn.setAttribute("href", redirectLink);
    })
}

function onLoadAnimations() {
    const loaderWrap = document.querySelector("#qb-loader-wrap");
    setTimeout(() => {
        loaderWrap.classList.add("qb-remove-loader");
    }, 2100);
}

function startApp() {
    onLoadAnimations();
    setAppStoreBtnLink();
}

window.addEventListener("load", startApp);