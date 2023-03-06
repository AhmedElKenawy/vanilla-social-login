//google
const baseUrl = 'https://api.***';

function onGoogleLogin(response) {
  if (response && response.credential) {
    validateGoogleLogin(response.credential);
  }
}

//facebook
function statusChangeCallback(response) {
  if (response.status === "connected") {
    try {
      google.accounts.id.disableAutoSelect();
    } catch (error) {
    }
    getFacebookUser(response.authResponse.accessToken);
    testAPI();
  } else {
    document.getElementById("home").style = "display:none";
    document.getElementById("login").style = "display:block";
  }
}

function checkLoginState() {
  FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function () {
  FB.init({
    appId: "*********", // FB App ID
    cookie: true, // enable cookies to allow the server to access the session
    xfbml: true, // parse social plugins on this page
    version: "v2.8", // use graph api version 2.8.
  });

  FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
  });
};

function testAPI() {
  FB.api("/me", function (response) {
    displayUserName(response.name);
  });
}
function logout() {
  try {
    FB.logout(checkLoginState);
    google.accounts.id.disableAutoSelect();
    location.reload();
  } catch (error) {
    console.log('error From login  ==>' ,error );
  }
}

(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

async function getCSRFToken() {
  try {
    const resp = await fetch(baseUrl + "/csrf");
    const token = await resp.json();
    if (!token || !token.csrfToken) {
      throw "Token Missing";
    } else {
      return token.csrfToken;
    }
  } catch (error) {
    return null;
  }
}
async function getFacebookUser(fbCode) {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) throw "Missing Token";
    const resp = await fetch(baseUrl + "/fbauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        csrf: csrfToken,
        userCode: fbCode,
      }),
    });
    const user = await resp.json();
    console.log("FaceBook Validation resp");
  } catch (error) {}
}
async function validateGoogleLogin(token) {
  try {
    const resp = await fetch(baseUrl + "/googleauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        idtoken: token,
      }),
    });
    const _resp = await resp.json();
    if (_resp.name) {
      displayUserName(_resp.name);
    }
  } catch (error) {}
}
function displayUserName(name) {
  document.getElementById("home").style = "display:flex";
  document.getElementById("login").style = "display:none";
  document.getElementById("login_status").innerHTML = "Thanks for logging in, " + name + "!";
}