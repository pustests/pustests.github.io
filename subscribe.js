/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BL-InUHqIEZRkTWmkSNWISRpzk5HqNqMNS7STmwzaxV5Q0cLQQ8IclDvmuEDu6oZ34fdnC_lHPmlgmFLsZ6QlhA';

const pathToServiceWorker = 'sw.js';
const pathToSenderService = 'https://pushnotificationsprototype.com/subscribtions/subscribe';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

sleep(5000).then(() => {
    subscribeUser();
});

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


if (('serviceWorker' in navigator && 'PushManager' in window) || ('Notification' in window)) {

  navigator.serviceWorker.register(pathToServiceWorker)
  .then(function(swReg) {
    swRegistration = swReg;
    initialiseUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.log('Уведомления не поддерживаются :/');
}


function initialiseUI() {
  subscribeUser();

  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);
  });
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;
  });
}

function updateSubscriptionOnServer(subscription) {

  if (subscription) {
    
    const subscriptionData = JSON.stringify(subscription);

    sendSubscriptionInfoToServer(subscriptionData);
  } else {
    console.errorg('Subscription is empty');    
  }
}

function sendSubscriptionInfoToServer(subscriptionData) {  
  debugger;
  console.log(`JSON:`, subscriptionData);
  var url = pathToSenderService;  

  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }
  
  
  xhr.open("POST", url, true);
  xhr.setRequestHeader('X-Custom-Header', 'value');
  xhr.setRequestHeader("Content-type","application/json");
  xhr.onreadystatechange = function () {
    debugger;
      if (xhr.readyState == 4 && xhr.status == 200) {
          console.log(xhr.responseText);
      }
 };

  // Response handlers.
  xhr.onload = function() {
    debugger;
    var text = xhr.responseText;
    var title = getTitle(text);
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    debugger;
    alert('Woops, there was an error making the request.');
  }; 
 
 xhr.send(subscriptionData);
}

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest() {
  // This is a sample server that supports CORS.
  var url = 'http://html5rocks-cors.s3-website-us-east-1.amazonaws.com/index.html';

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send();
}