
function removeLogs(){
    let origin = window.location.origin;
    if(!origin.includes("localhost") && !origin.includes("127.0.0.1")) console.log = function(){};
}

function setAppStoreBtnLink() {
    const appStoreBtns = document.querySelectorAll(".qb-download-btn");
    if(appStoreBtns?.length){
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
}

function onLoadAnimations() {
    const loaderWrap = document.querySelector(".qb-loader");
    if(!loaderWrap.classList.contains("qb-wait-loader")){
        setTimeout(() => {
            console.log("Loaded");
            loaderWrap.classList.add("qb-remove-loader");
        }, 2100);
    }
}

function startApp() {
    removeLogs();
    onLoadAnimations();
    setAppStoreBtnLink();
}

window.addEventListener("load", startApp);