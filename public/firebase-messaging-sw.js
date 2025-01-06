importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBghTLBc89fT0fLsym6iZd7cRJhNITu8UI",
    authDomain: "savemom-1fb50.firebaseapp.com",
    projectId: "savemom-1fb50",
    storageBucket: "savemom-1fb50.appspot.com",
    messagingSenderId: "6408579342",
    appId: "1:6408579342:web:4236b87a3cdf101770cf5f",
    measurementId: "G-2CQP29XPM1"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png' // Change to your icon path
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
