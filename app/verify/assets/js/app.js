const ENV = "prod";
const API_BASE_URL = {
    "dev": "https://dev.qffer.in/qbshopper",
    "qa": "https://qa.qffer.in/qbshopper",
    "prod": "https://prod.qffer.in/qbshopper"
};

let timeoutId;

function getQueryItems() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

async function verifyEmail(key, id) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let url = `${API_BASE_URL[ENV]}/api-v1-0/customer/auth/verify/cx/email/${key}`;
    let body = JSON.stringify({
        value: id
    });
    let requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: myHeaders,
        body: body,
    };

    let result
    try {
        let response = await fetch(url, requestOptions);
        result = await response.text();
    } catch (error) {
        result = { message: "failure", body: "Something went wrong." };
    }
    return result;
}

function onError(){
    const loaderBorder = document.querySelector("#qb-loader-border");
    const loaderFill = document.querySelector(".qb-loader-fill");
    const messageContainer  = document.querySelector("#qb-message-section");
    const messageWrap = document.createElement("div");
    messageWrap.classList.add("qb-message-wrap");
    let content = `<h2 class="qb-title">Verification failed.</h2>
    <p class="qb-desc">
        Account verification process failed. Please try again later or complete verification from your Qffer app. Qffer enables you to find the best offers
        and deals near your location that are tailor made for your needs.
    </p>
    <div class="qb-btn-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.skellam.qffer" id="qb-download-btn"
            class="qb-btn">Download Qffer</a>
    </div>`;
    try {
        clearTimeout(timeoutId);
    } catch (error) { }
    messageWrap.innerHTML = content;
    messageContainer.classList.add("qb-message-active");
    loaderBorder.classList.remove("qb-loader-boder-anime");
    loaderBorder.classList.add("qb-bg-dark");
    loaderFill.classList.add("qb-bg-dark");
    messageContainer.appendChild(messageWrap);
    messageWrap.classList.add("qb-message-opacity");
    loaderFill.classList.add("qb-logo-sm-wrap");
}

function onVerifySuccess() {
    const qbBody = document.querySelector("#qb-main-body");
    let mainContent = document.createElement("div");
    mainContent.classList.add("qb-body-wrap");
    let content = `<div class="qb-header-wrap">
            <div class="qb-header qb-opacity-item">
                <svg width="32" height="31" viewBox="0 0 32 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M31.6391 29.8326L32 30.0334L31.8242 29.7931C29.7845 27.0097 29.2562 23.4276 30.289 20.1345C31.2019 17.2271 31.2378 14.1151 30.392 11.1874C29.5462 8.25971 27.8563 5.64622 25.5336 3.67355C19.1888 -1.7226 9.61345 -1.10269 4.01759 5.0642C1.61495 7.71473 0.202699 11.1145 0.0202005 14.6873C-0.162298 18.26 0.896185 21.786 3.01624 24.6676C5.1363 27.5491 8.18751 29.609 11.6527 30.498C15.1179 31.387 18.7839 31.0505 22.0294 29.5456C25.1081 28.1206 28.6716 28.1861 31.6391 29.8326ZM9.88492 10.1379C12.6932 7.18501 17.3915 6.93538 20.5025 9.56793C21.6796 10.5639 22.533 11.8883 22.9536 13.3719C23.3741 14.8554 23.3428 16.4306 22.8636 17.8962C22.5855 18.7213 22.5256 19.6043 22.6896 20.4595C22.8537 21.3146 23.2361 22.1128 23.7997 22.7764L23.8808 22.8711L23.7768 22.8024C23.054 22.3255 22.2198 22.0444 21.3558 21.9866C20.4917 21.9288 19.6275 22.0963 18.8477 22.4727C17.2122 23.257 15.3534 23.4429 13.595 22.9982C11.8365 22.5535 10.2897 21.5062 9.22373 20.0387C8.15776 18.5711 7.64013 16.7763 7.76094 14.9665C7.88175 13.1567 8.63335 11.4466 9.88492 10.1338V10.1379Z" fill="#DB2726"/>
                </svg>    
            </div>
        </div>
        <div class="qb-content-wrap">
            <div class="qb-content">
                <h2 class="qb-title qb-translate-item">Qffer account verified.</h2>
                <p class="qb-desc qb-translate-item">
                    Your qffer account has been verified using your email. Qffer enables you to find the best offers
                    and deals near your location that are tailor made for your needs.
                </p>
                <div class="qb-btn-wrapper qb-translate-item">
                    <a href="https://play.google.com/store/apps/details?id=com.skellam.qffer" id="qb-download-btn"
                        class="qb-btn">Download Qffer</a>
                </div>
            </div>
        </div>
        <div class="qb-image-wrap">
            <div class="qb-image-container qb-translate-item qb-translate-item-slow">
                <img src="../../assets/images/hero-mockup.png" alt="qffer mockup" class="qb-hero-image">
            </div>
        </div>`;
    try {
        clearTimeout(timeoutId);
    } catch (error) { }
    mainContent.innerHTML = content;
    qbBody.appendChild(mainContent);
    const loaderWrap = document.querySelector("#qb-loader-wrap");
    loaderWrap.classList.add("qb-remove-loader");
    setTimeout(() => {
        loaderWrap.innerHTML = "";
        const translateAnime = document.querySelectorAll(".qb-translate-item");
        const opacityAnime = document.querySelectorAll(".qb-opacity-item");
        translateAnime.forEach(item=>{
            item.classList.add("qb-translate-anime");
        });
        opacityAnime.forEach(item=>{
            item.classList.add("qb-opacity-anime");
        });
        appStoreBtnListener();
    }, 600);
}

async function checkQuery() {
    let query = getQueryItems();
    if (query && query.cx && query.k) {
        let response = await verifyEmail(query.k, query.cx);
        if(response && response.message==="success"){
            setTimeout(() => {
                onVerifySuccess();
            }, 1000);
        }
        else{
            setTimeout(() => {
                onError();
            }, 1000);
        }
    }
    else{
        setTimeout(() => {
            onError();
        }, 2000);
    }
}

function appStoreBtnListener() {
    const appStoreBtn = document.querySelector("#qb-download-btn");
    const playstoreLink = "https://play.google.com/store/apps/details?id=com.skellam.qffer";
    const iosStoreLink = "https://apps.apple.com/in/app/qffer/id6444561397";
    let redirectLink;
    let userAgent = window.navigator ? window.navigator.userAgent : null;
    if (userAgent && (/iPhone/.test(userAgent) || /iPad/.test(userAgent))) redirectLink = iosStoreLink;
    else redirectLink = playstoreLink;
    appStoreBtn.setAttribute("href", redirectLink);
}

function addLoaderAnime() {
    try {
        const loaderBorder = document.querySelector("#qb-loader-border");
        timeoutId = setTimeout(() => {
            loaderBorder.classList.add("qb-loader-boder-anime");
        }, 3500);
    } catch (error) { }
}

function startApp() {
    checkQuery();
    addLoaderAnime();
}

window.addEventListener("load", startApp);