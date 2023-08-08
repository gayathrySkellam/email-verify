
function removeLogs(){
    let origin = window.location.origin;
    if(!origin.includes("localhost") && !origin.includes("127.0.0.1")) console.log = function(){};
}

async function apiPost(url, data, token) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if(token) myHeaders.append("token", token);
    let response;
    let requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: myHeaders,
        body: data,
    };
    try {
        let result = await fetch(url, requestOptions);
        response = await result.text();
        if (response) return JSON.parse(response);
        else return ({ message: "failure", body: "Something went wrong! Please try again after some time." });
    } catch (error) {
        console.log("error: ", error);
        response = { message: "failure", body: "Something went wrong! Please try again after some time." };
        return response;
    }
}

async function apiPut(url, data, token) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if(token) myHeaders.append("token", token);
    let response;
    let requestOptions = {
        method: 'PUT',
        redirect: 'follow',
        headers: myHeaders,
        body: data,
    };
    try {
        let result = await fetch(url, requestOptions);
        response = await result.text();
        if (response) return JSON.parse(response);
        else return ({ message: "failure", body: "Something went wrong! Please try again after some time." });
    } catch (error) {
        console.log("error: ", error);
        response = { message: "failure", body: "Something went wrong! Please try again after some time." };
        return response;
    }
}

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

/* Email field Validation */
async function emailValidation(email) {
    let emailPattern = /^\w+([\+\.-]?\w+)*@\w+([\.-]?\w{2,8})*(\.\w{2,8})+$/;
    if (email?.length <= 320) return emailPattern.test(email);
    else return false;
}

/* Password field Validation */
async function passwordValidation(password) {
    let passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#\$%\^&\*]).{6,40}$/;
    return passwordPattern.test(password);
}

/* Name validation */
async function nameValidation(name) {
    let namePattern = /^(([a-zA-Z])+([ a-zA-Z]*)){2,50}$/;
    if (name?.length <= 50) return namePattern.test(name);
    else return false;
}

/* Phone Number Validation */
async function phoneValidation(phone) {
    let phoneNumberPattern = /^\d{10}$/;
    return phoneNumberPattern.test(phone);
}

/* Zipcode Validation */
async function zipcodeValidation(zipcode) {
	let zipcodeNumberPattern = /^\d{5}(-\d{4})?$/;
	return zipcodeNumberPattern.test(zipcode);
}

/* Return error texts */
async function returnErrorTexts(value, type) {
    let errorMessage = "";
    switch (type) {
        case "email": {
            if (value[value?.length - 1] === " " || value[0] === " ") errorMessage = "Email should not begin or end with spaces.";
            else if (value?.length > 320) errorMessage = "Email should not be more than 320 characters";
            else errorMessage = "Invalid email format. Please enter a valid email format";
            break;
        }
        case "name": {
            if (value?.length < 2) errorMessage = "Name should be at least 2 characters";
            else if (value[0] === " ") errorMessage = "Name should not begin with a space.";
            else if (value?.length > 50) errorMessage = "Name should not be more than 50 characters";
            else errorMessage = "Name contains invalid characters. Please enter a valid name";
            break;
        }
        case "phone": {
            if (value[value?.length - 1] === " " || value[0] === " ") errorMessage = "Phone number should not begin or end with spaces.";
            else if (value.length != 10) errorMessage = "Phone number should have exactly 10 digits";
            else errorMessage = "Phone number should have only digits.";
            break;
        }
        case "password": {
            if (value?.length < 6) errorMessage = "Password should be at least 6 characters";
            else if (value?.length > 40) errorMessage = "Password should not be more than 40 characters";
            else errorMessage = "Password Insecure! Password should contain alphabets, numbers and special characters";
            break;
        }
    }
    return errorMessage;
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