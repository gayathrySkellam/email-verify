const ENV = "qa";
const API_BASE_URL = {
    "dev": "https://dev.qffer.in/qbshopper",
    "qa": "https://qa.qffer.in/qbshopper",
    "prod": "https://prod.qffer.in/qbshopper"
};
let apiLoader =false;
let passwordHidden = true;
let pageType = "SIGNUP";        //pageTypes: SIGNUP, VERIFY_OTP
let storeId="DOU";
let storeReferral;
let customerId;
let userData;
let resendTries = 2;
let maxCount = 30;
let isResendDisabled = true;

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
    if(email?.length<=320) return emailPattern.test(email);
    else return false;
}

/* Password field Validation */
async function passwordValidation(password) {
    let passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#\$%\^&\*]).{6,40}$/;
    return passwordPattern.test(password);
}

/* Name validation */
async function nameValidation(name){
    let namePattern = /^(([a-zA-Z])+([ a-zA-Z]*)){2,50}$/;
    if(name?.length<=50) return namePattern.test(name);
    else return false;
}

/* Phone Number Validation */
async function phoneValidation(phone) {
	let phoneNumberPattern = /^\d{10}$/;
	return phoneNumberPattern.test(phone);
}

/* Return error texts */
async function returnErrorTexts(value, type){
    let errorMessage="";
    switch (type) {
        case "email": {
            if(value[value?.length-1]===" " || value[0]===" ") errorMessage= "Email should not begin or end with spaces.";
            else if(value?.length>320) errorMessage= "Email should not be more than 320 characters";
            else errorMessage = "Invalid email format. Please enter a valid email format";
            break;
        }
        case "name": {
            if(value?.length<2) errorMessage = "Name should be at least 2 characters";
            else if(value[0]===" ") errorMessage = "Name should not begin with a space.";
            else if(value?.length>50) errorMessage = "Name should not be more than 50 characters";
            else errorMessage = "Name contains invalid characters. Please enter a valid name";
            break;
        }
        case "phone": {
            if(value[value?.length-1]===" " || value[0]===" ") errorMessage= "Phone number should not begin or end with spaces.";
            else if(value.length!=10) errorMessage= "Phone number should have exactly 10 digits";
            else errorMessage = "Phone number should have only digits.";
            break;
        }
        case "password": {
            if(value?.length<6) errorMessage = "Password should be at least 6 characters";
            else if(value?.length>40) errorMessage = "Password should not be more than 40 characters";
            else errorMessage = "Password Insecure! Password should contain alphabets, numbers and special characters";
            break;
        }
    }
    return errorMessage;
}

async function apiPost(url, data){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
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
        if(response) return JSON.parse(response);
        else return({ message: "failure", body: "Something went wrong! Please try again after some time." });
    } catch (error) {
        console.log("error: ", error);
        response = { message: "failure", body: "Something went wrong! Please try again after some time." };
        return response;
    }
}

function onCounterRun(){
    const resendCounter = document.querySelector(".qb-counter-wrap");
    resendCounter.parentElement.classList.add("qb-link-disabled");
    isResendDisabled = true;

    let countInterval=setInterval(onCount, 1000);
    let currentCount = maxCount;
    resendCounter.innerHTML= `(${currentCount}s)`;

    function onCount(){
        currentCount = currentCount-1;
        resendCounter.innerHTML= `(${currentCount}s)`;
        if(currentCount< 0) {
            isResendDisabled = false;
            clearInterval(countInterval);
            resendCounter.parentElement.classList.remove("qb-link-disabled");
            resendCounter.innerHTML = `(${resendTries} tr${resendTries===1? "y":"ies"} remaining)`;
        }
    }
}

function onResendClick(){
    const resendCounter = document.querySelector("qb-counter-wrap");

    console.log("on resend click");
    resendTries = resendTries-1;
    if(resendTries>0){
        handleResendOtp();
        onCounterRun();
    }
    else if(resendTries===0){
        resendCounter.parentElement.classList.add("qb-link-disabled");
        isResendDisabled = true;
    }
}

function triggerSuccessModal(){
    const backdrop = document.querySelector(".qb-modal-backdrop");
    const modal = document.querySelector(".qb-modal-container");

    backdrop.classList.remove("d-none");
    modal.classList.remove("d-none");
    setTimeout(() => {
        modal.classList.add("qb-modal-active");
    }, 200);
}

async function resetScreen(){
    const nameInput = document.querySelector("#qb-name");
    const emailInput = document.querySelector("#qb-email");
    const phoneInput = document.querySelector("#qb-phone");
    const referralInput = document.querySelector("#qb-referral");
    const titleElement = document.querySelectorAll(".qb-signup-title-text");
    const signupButton = document.querySelector("#qb-signup-btn");
    const passwordInput = document.querySelector("#qb-password");
    const resentOtpWrap = document.querySelector(".qb-resend-wrap");
    pageType = "SIGNUP";  
    customerId=null;
    userData=null;
    resendTries = 2;
    maxCount = 30;
    isResendDisabled = true;

    nameInput.parentElement.classList.remove("d-none");
    emailInput.parentElement.classList.remove("d-none");
    phoneInput.parentElement.classList.remove("d-none");
    referralInput.parentElement.classList.remove("d-none");
    resentOtpWrap.classList.add("d-none");
    nameInput.value="";
    emailInput.value="";
    phoneInput.value="";
    referralInput.value="";
    passwordInput.value = "";
    passwordInput.setAttribute("placeholder", "*********");
    passwordInput.parentElement.previousElementSibling.innerHTML = "Password";
    signupButton.innerHTML = "Join account";
    titleElement.forEach(item=>{
        item.innerHTML = "Create account";
    });
}

async function navigateToOtpScreen(body){
    const nameInput = document.querySelector("#qb-name");
    const emailInput = document.querySelector("#qb-email");
    const phoneInput = document.querySelector("#qb-phone");
    const referralInput = document.querySelector("#qb-referral");
    const titleElement = document.querySelectorAll(".qb-signup-title-text");
    const signupButton = document.querySelector("#qb-signup-btn");
    const passwordInput = document.querySelector("#qb-password");
    const resentOtpWrap = document.querySelector(".qb-resend-wrap");
    customerId = body.customerId;  
    pageType = "VERIFY_OTP";  

    nameInput.parentElement.classList.add("d-none");
    emailInput.parentElement.classList.add("d-none");
    phoneInput.parentElement.classList.add("d-none");
    referralInput.parentElement.classList.add("d-none");
    resentOtpWrap.classList.remove("d-none");
    passwordInput.value = "";
    passwordInput.setAttribute("placeholder", "****");
    passwordInput.parentElement.previousElementSibling.innerHTML = "OTP";
    signupButton.innerHTML = "Verify OTP";
    titleElement.forEach(item=>{
        item.innerHTML = "Verify OTP";
    });
    onCounterRun();
}

async function handleResendOtp(){
    if(!isResendDisabled){
        let url = `${API_BASE_URL[ENV]}/api-v1-0/customer/web/create/phone/verify`;
        let data = JSON.stringify({
            "value": userData.phone
        });
        let response = await apiPost(url, data);
        if(response?.message==="success"){
            console.log("response: ", response);
        }
    }
}

async function handleOtpVerify(otp){
    const signupButton = document.querySelector("#qb-signup-btn");
    const errorWrap = document.querySelector(".qb-general-error");

    if(!apiLoader && userData?.phone){
        apiLoader = true;
        errorWrap.classList.remove("qb-error-active");
        signupButton.classList.add("qb-btn-loading");
        let url = `${API_BASE_URL[ENV]}/api-v1-0/customer/web/create/phone/verify/${otp}`;
        let data = JSON.stringify({
            "value": userData.phone
        });
        let response = await apiPost(url, data);
        if(response?.message==="success"){
            console.log("response: ", response);
            signupButton.classList.remove("qb-btn-loading");
            apiLoader=false;
            triggerSuccessModal();
            resetScreen();
        }
        else if(response?.message==="failure" && response.body){
            errorWrap.innerHTML = response.body;
            errorWrap.classList.add("qb-error-active");
            signupButton.classList.remove("qb-btn-loading");
            apiLoader = false;
        }
        else{
            errorWrap.innerHTML = "Something went wrong! Please try again after some time.";
            errorWrap.classList.add("qb-error-active");
            signupButton.classList.remove("qb-btn-loading");
            apiLoader = false;
        }
    }
    else{
        errorWrap.innerHTML = "Something went wrong! Please try again after some time.";
        errorWrap.classList.add("qb-error-active");
    }
}

async function handleSignup({name, email, phone, password, referral}){
    const signupButton = document.querySelector("#qb-signup-btn");
    const errorWrap = document.querySelector(".qb-general-error");

    if(!apiLoader && storeId){
        apiLoader = true;
        errorWrap.classList.remove("qb-error-active");
        signupButton.classList.add("qb-btn-loading");
        let url = `${API_BASE_URL[ENV]}/api-v1-0/customer/web/signUp/email/${storeId}`;
        let data = JSON.stringify({
            "name": name,
            "email": email.toLowerCase(),
            "phone": phone,
            "password": password,
            "deviceId": null,
            "referralCode": referral ? referral?.toUpperCase() : null
        });
        let response = await apiPost(url, data);
        if(response?.message==="success"){
            console.log("response: ", response);
            userData = {name, email, phone};
            signupButton.classList.remove("qb-btn-loading");
            apiLoader=false;
            navigateToOtpScreen(response.body);
        }
        else if(response?.message==="failure" && response.body){
            errorWrap.innerHTML = response.body;
            errorWrap.classList.add("qb-error-active");
            signupButton.classList.remove("qb-btn-loading");
            apiLoader = false;
        }
        else{
            errorWrap.innerHTML = "Something went wrong! Please try again after some time.";
            errorWrap.classList.add("qb-error-active");
            signupButton.classList.remove("qb-btn-loading");
            apiLoader = false;
        }
    }
    else if(!storeId){
        errorWrap.innerHTML = "Signup link invalid. Please try again with another link.";
        errorWrap.classList.add("qb-error-active");
    }
    else{
        errorWrap.innerHTML = "Something went wrong! Please try again after some time.";
        errorWrap.classList.add("qb-error-active");
    }
}

async function onOtpFormSubmit(){
    const passwordInput = document.querySelector("#qb-password");

    let otp = passwordInput.value;
    if(otp?.length && otp.length===4) handleOtpVerify(otp);
    else{
        let errorMessage = "Invalid OTP format! Please enter a valid OTP.";
        passwordInput.parentElement.nextElementSibling.innerHTML = errorMessage;
        passwordInput.parentElement.parentElement.classList.add('qb-input-error');
    }
}

async function onSignupFormSubmit(){
    const nameInput = document.querySelector("#qb-name");
    const emailInput = document.querySelector("#qb-email");
    const phoneInput = document.querySelector("#qb-phone");
    const passwordInput = document.querySelector("#qb-password");
    const referralInput = document.querySelector("#qb-referral");

    let name = nameInput.value;
    let email = emailInput.value;
    let phone = phoneInput.value;
    let password = passwordInput.value;
    let referral = referralInput.value;

    let isNameValid, isEmailValid, isPhoneValid, isPasswordValid = false;

    if(name?.length) isNameValid = await nameValidation(name);
    else isNameValid = false;

    if(email?.length) isEmailValid = await emailValidation(email);
    else isEmailValid = false;

    if(phone?.length) isPhoneValid = await phoneValidation(phone);
    else isPhoneValid = false;

    if(password?.length) isPasswordValid = await passwordValidation(password);
    else isPasswordValid = false;

    if(isNameValid && isEmailValid && isPhoneValid && isPasswordValid){
        handleSignup({name, email, phone, password, referral});
        nameInput.parentElement.classList.remove('qb-input-error');
        emailInput.parentElement.classList.remove('qb-input-error');
        passwordInput.parentElement.parentElement.classList.remove('qb-input-error');
        phoneInput.parentElement.classList.remove('qb-input-error');
    }
    else{
        if(!isNameValid){
            let errorMessage = "This is required field. Please enter a value.";
            if(name?.length) errorMessage = await returnErrorTexts(name, "name");
            nameInput.nextElementSibling.innerHTML = errorMessage;
            nameInput.parentElement.classList.add('qb-input-error');
        }
        else nameInput.parentElement.classList.remove('qb-input-error');
        if(!isEmailValid){
            let errorMessage = "This is required field. Please enter a value.";
            if(email?.length) errorMessage = await returnErrorTexts(email, "email");
            emailInput.nextElementSibling.innerHTML = errorMessage;
            emailInput.parentElement.classList.add('qb-input-error');
        }
        else emailInput.parentElement.classList.remove('qb-input-error');
        if(!isPasswordValid){
            let errorMessage = "This is required field. Please enter a value.";
            if(password?.length) errorMessage = await returnErrorTexts(password, "password");
            passwordInput.parentElement.nextElementSibling.innerHTML = errorMessage;
            passwordInput.parentElement.parentElement.classList.add('qb-input-error');
        }
        else passwordInput.parentElement.parentElement.classList.remove('qb-input-error');
        if(!isPhoneValid){
            let errorMessage = "This is required field. Please enter a value.";
            if(phone?.length) errorMessage = await returnErrorTexts(phone, "phone");
            phoneInput.nextElementSibling.innerHTML = errorMessage;
            phoneInput.parentElement.classList.add('qb-input-error');
        }
        else phoneInput.parentElement.classList.remove('qb-input-error');
    }
}

function eyeBtnListener(){
    const eyeBtnWrap = document.querySelector("#qb-eye-btn");
    const passwordInput = document.querySelector("#qb-password");

    function handleEyeBtnClick(){
        let type = passwordHidden? "text": "password";
        let icon = `<svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.60259 8.75C1.71897 8.95589 1.89014 9.24606 2.11427 9.59311C2.58113 10.316 3.27286 11.2779 4.17202 12.237C5.984 14.1698 8.54949 16 11.7499 16C14.9502 16 17.5157 14.1698 19.3277 12.237C20.2269 11.2779 20.9186 10.316 21.3855 9.59311C21.6096 9.24606 21.7808 8.95589 21.8971 8.75C21.7808 8.54411 21.6096 8.25394 21.3855 7.90689C20.9186 7.18402 20.2269 6.22205 19.3277 5.26296C17.5157 3.33017 14.9502 1.5 11.7499 1.5C8.54949 1.5 5.984 3.33017 4.17202 5.26296C3.27286 6.22205 2.58113 7.18402 2.11427 7.90689C1.89014 8.25394 1.71897 8.54411 1.60259 8.75ZM22.7499 8.75C23.4207 8.41459 23.4206 8.41433 23.4204 8.41404L23.419 8.41129L23.4159 8.40508L23.4052 8.38413C23.3961 8.36643 23.3831 8.34135 23.3661 8.30937C23.3323 8.24542 23.2828 8.15383 23.218 8.03855C23.0884 7.80811 22.8969 7.48239 22.6455 7.09311C22.1436 6.31598 21.3979 5.27795 20.422 4.23704C18.484 2.16983 15.5495 0 11.7499 0C7.95023 0 5.01572 2.16983 3.07771 4.23704C2.10186 5.27795 1.3561 6.31598 0.854208 7.09311C0.602797 7.48239 0.411355 7.80811 0.281728 8.03855C0.216886 8.15383 0.167427 8.24542 0.133585 8.30937C0.116662 8.34135 0.103636 8.36643 0.0945379 8.38413L0.0838363 8.40508L0.0806995 8.41129L0.0796857 8.4133L0.0793175 8.41404C0.0791721 8.41433 0.079042 8.41459 0.749862 8.75L0.0793175 8.41404C-0.0262553 8.62519 -0.0265308 8.87426 0.079042 9.08541L0.749862 8.75C0.079042 9.08541 0.0788966 9.08512 0.079042 9.08541L0.0796857 9.0867L0.0806995 9.08871L0.0838363 9.09492L0.0945379 9.11587C0.103636 9.13357 0.116662 9.15865 0.133585 9.19063C0.167427 9.25459 0.216886 9.34617 0.281728 9.46145C0.411355 9.69189 0.602797 10.0176 0.854208 10.4069C1.3561 11.184 2.10186 12.2221 3.07771 13.263C5.01572 15.3302 7.95023 17.5 11.7499 17.5C15.5495 17.5 18.484 15.3302 20.422 13.263C21.3979 12.2221 22.1436 11.184 22.6455 10.4069C22.8969 10.0176 23.0884 9.69189 23.218 9.46145C23.2828 9.34617 23.3323 9.25459 23.3661 9.19063C23.3831 9.15865 23.3961 9.13357 23.4052 9.11587L23.4159 9.09492L23.419 9.08871L23.4204 9.08596C23.4206 9.08567 23.4207 9.08541 22.7499 8.75ZM22.7499 8.75L23.4204 9.08596C23.526 8.87482 23.526 8.62519 23.4204 8.41404L22.7499 8.75ZM11.7499 6.49988C10.5072 6.49988 9.49986 7.50724 9.49986 8.74988C9.49986 9.99252 10.5072 10.9999 11.7499 10.9999C12.9925 10.9999 13.9999 9.99252 13.9999 8.74988C13.9999 7.50724 12.9925 6.49988 11.7499 6.49988ZM7.99986 8.74988C7.99986 6.67881 9.67879 4.99988 11.7499 4.99988C13.8209 4.99988 15.4999 6.67881 15.4999 8.74988C15.4999 10.8209 13.8209 12.4999 11.7499 12.4999C9.67879 12.4999 7.99986 10.8209 7.99986 8.74988Z" fill="#4A9689"/>
                    </svg>`;
        if(passwordHidden){
            icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.21967 0.21967C0.512563 -0.0732233 0.987437 -0.0732233 1.28033 0.21967L10.1574 9.09672C10.1577 9.09702 10.158 9.09731 10.1583 9.09761C10.1594 9.09876 10.1606 9.09991 10.1617 9.10106C10.162 9.10136 10.1623 9.10166 10.1626 9.10196L14.3981 13.3374C14.3984 13.3377 14.3987 13.338 14.399 13.3383C14.4001 13.3394 14.4012 13.3406 14.4024 13.3417C14.4026 13.342 14.4029 13.3423 14.4032 13.3426L23.2803 22.2197C23.5732 22.5126 23.5732 22.9874 23.2803 23.2803C22.9874 23.5732 22.5126 23.5732 22.2197 23.2803L17.609 18.6696C15.881 19.8277 13.8514 20.4658 11.7623 20.4999L11.75 20.5C7.95037 20.5 5.01586 18.3302 3.07785 16.263C2.102 15.2221 1.35624 14.184 0.854346 13.4069C0.602934 13.0176 0.411492 12.6919 0.281865 12.4615C0.217023 12.3462 0.167564 12.2546 0.133723 12.1906C0.1168 12.1587 0.103774 12.1336 0.0946755 12.1159L0.083974 12.0949L0.0808372 12.0887L0.0798233 12.0867L0.0794552 12.086C0.0793097 12.0857 0.0791796 12.0854 0.75 11.75L0.0794552 12.086C-0.0295285 11.868 -0.0260922 11.6101 0.0891333 11.3954C1.24869 9.23445 2.8102 7.31803 4.68709 5.74775L0.21967 1.28033C-0.0732233 0.987437 -0.0732233 0.512563 0.21967 0.21967ZM5.7523 6.81296C4.07936 8.19129 2.67321 9.86573 1.60457 11.7533C1.7209 11.9589 1.89145 12.2479 2.1144 12.5931C2.58126 13.316 3.273 14.278 4.17215 15.2371C5.98298 17.1686 8.54636 18.9977 11.7439 19C13.4416 18.9711 15.0935 18.4792 16.5244 17.5851L13.8319 14.8926C13.6343 15.0315 13.4232 15.1514 13.2014 15.2502C12.7414 15.4552 12.2448 15.5654 11.7413 15.5743C11.2378 15.5831 10.7377 15.4905 10.2707 15.3019C9.80378 15.1133 9.37961 14.8326 9.02352 14.4765C8.66742 14.1204 8.3867 13.6962 8.19809 13.2293C8.00949 12.7623 7.91687 12.2622 7.92575 11.7587C7.93463 11.2552 8.04484 10.7586 8.2498 10.2986C8.34862 10.0768 8.46849 9.86573 8.60744 9.6681L5.7523 6.81296ZM9.69528 10.7559C9.66828 10.8059 9.64315 10.857 9.61995 10.9091C9.49697 11.1851 9.43085 11.483 9.42552 11.7851C9.42019 12.0873 9.47576 12.3873 9.58892 12.6675C9.70209 12.9477 9.87052 13.2022 10.0842 13.4158C10.2978 13.6295 10.5523 13.7979 10.8325 13.9111C11.1127 14.0242 11.4128 14.0798 11.7149 14.0745C12.017 14.0692 12.3149 14.003 12.5909 13.8801C12.643 13.8569 12.6941 13.8317 12.7441 13.8047L9.69528 10.7559ZM11.2343 4.51459L20.5292 13.818C21.0324 13.1607 21.489 12.4688 21.8958 11.7474C21.7795 11.5417 21.6088 11.2525 21.3856 10.9069C20.9187 10.184 20.227 9.22206 19.3278 8.26296C17.5159 6.33018 14.9504 4.50001 11.75 4.50001L11.7482 4.5C11.5767 4.4996 11.4053 4.50447 11.2343 4.51459ZM22.75 11.75L23.4208 11.4146C23.5296 11.6322 23.5261 11.889 23.4114 12.1036C22.7798 13.2852 22.0265 14.3977 21.1639 15.4229C21.0286 15.5837 20.832 15.6803 20.622 15.6893C20.4121 15.6983 20.208 15.6188 20.0594 15.4701L9.11943 4.52009C8.92707 4.32756 8.85411 4.04593 8.92879 3.78421C9.00347 3.52249 9.21407 3.32177 9.47907 3.25975C10.2237 3.08544 10.9861 2.99828 11.7509 3.00001C11.7512 3.00001 11.7515 3.00001 11.7518 3.00001L11.75 3.75001V3.00001C11.7503 3.00001 11.7506 3.00001 11.7509 3.00001C15.5501 3.00034 18.4843 5.17 20.4222 7.23705C21.398 8.27795 22.1438 9.31599 22.6457 10.0931C22.8971 10.4824 23.0885 10.8081 23.2181 11.0386C23.283 11.1538 23.3324 11.2454 23.3663 11.3094C23.3832 11.3414 23.3962 11.3664 23.4053 11.3841L23.416 11.4051L23.4192 11.4113L23.4208 11.4146C23.421 11.4149 23.4208 11.4146 22.75 11.75Z" fill="#4A9689"/>
                    </svg>`;
        }
        passwordHidden = !passwordHidden;
        passwordInput.setAttribute("type", type);
        eyeBtnWrap.innerHTML = icon;        
    }

    eyeBtnWrap.addEventListener("click", handleEyeBtnClick);
}

function checkQuery() {
    const referralInput = document.querySelector("#qb-referral");
    let query = getQueryItems();
    if(query.amx) storeId = query.amx;
    if(query.ref){
        storeReferral = query.ref;
        referralInput.value = query.ref;
    }
}

function onFormSubmit(){
    if(pageType==="SIGNUP") onSignupFormSubmit();
    else if(pageType==="VERIFY_OTP") onOtpFormSubmit();
}

function closeModal(){
    const backdrop = document.querySelector(".qb-modal-backdrop");
    const modal = document.querySelector(".qb-modal-container");

    modal.classList.remove("qb-modal-active");
    setTimeout(() => {
        backdrop.classList.add("d-none");
        modal.classList.add("d-none");
    }, 400);
}

function onBackdropClick(){
    const backdrop = document.querySelector(".qb-modal-backdrop");

    backdrop.addEventListener("click", closeModal);
}

function signupButtonListener(){
    const signupButton = document.querySelector("#qb-signup-btn");
    
    signupButton.addEventListener("click", onFormSubmit);
}

function resendClickListener(){
    const resendButton = document.querySelector(".qb-resend-otp-link");

    resendButton.addEventListener("click", onResendClick);
}

function startApp() {
    checkQuery();
    eyeBtnListener();
    signupButtonListener();
    resendClickListener();
    onBackdropClick();
}

window.addEventListener("load", startApp);