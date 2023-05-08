const ENV = "qa";
const API_BASE_URL = {
    "dev" : "https://dev.qffer.in/qbshopper",
    "qa": "https://qa.qffer.in/qbshopper",
    "prod": "https://prod.qffer.in/qbshopper"
};

let timeoutId;

async function verifyEmail(key, id){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let url = `${API_BASE_URL[ENV]}/customer/auth/verify/cx/email/${key}`;
    let body = JSON.stringify({
        value: id
    });
    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: myHeaders,
        body: body,
    };

    let result
    try {
        let response= await fetch(url, requestOptions);
        result  = await response.text();
    } catch (error) {
        result = {message: "failure", body: "Something went wrong."};
    }
    return result;
}

function removeLoader(){
    const loaderWrap = document.querySelector("#qb-loader-wrap");
    loaderWrap.classList.add("qb-remove-loader"); 
    
}

function appStoreBtnListener(){
    const appStoreBtn = document.querySelector("#qb-download-btn");
    const playstoreLink = "https://play.google.com/store/apps/details?id=com.skellam.qffer";
    const iosStoreLink = "https://apps.apple.com/in/app/qffer/id6444561397";
    let redirectLink;
    let userAgent = window.navigator? window.navigator.userAgent: null;
    if(userAgent && (/iPhone/.test(userAgent) || /iPad/.test(userAgent))) redirectLink = iosStoreLink;
    else redirectLink = playstoreLink;
    appStoreBtn.setAttribute("href", redirectLink);
}

function addLoaderAnime(){
    // const loaderBorder = document.querySelector("#qb-loader-border");
    // timeoutId = setTimeout(() => {
    //     loaderBorder.classList.add("qb-loader-boder-anime");
    // }, 3500);
    // setTimeout(removeLoader, 5000);
}

function startApp(){
    addLoaderAnime();
    appStoreBtnListener();
}

window.addEventListener("load",startApp);