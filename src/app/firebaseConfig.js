import { initializeApp } from '@firebase/app';
import { getMessaging, getToken, onMessage } from '@firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyBghTLBc89fT0fLsym6iZd7cRJhNITu8UI",
    authDomain: "savemom-1fb50.firebaseapp.com",
    projectId: "savemom-1fb50",
    storageBucket: "savemom-1fb50.appspot.com",
    messagingSenderId: "6408579342",
    appId: "1:6408579342:web:4236b87a3cdf101770cf5f",
    measurementId: "G-2CQP29XPM1"
};
const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// // Request permission and get the token
// const getDeviceToken = async () => {
//     try {
//         const permission = await Notification.requestPermission();
//         if (permission === 'granted') {
//             const vapidKey = 'YOUR_VAPID_KEY';
//             const token = await getToken(messaging, { vapidKey });
//             console.log('Token:', token);
//             // Save the token (e.g., to your server)
//         } else {
//             console.error("Permission not granted for notifications.");
//         }
//     } catch (error) {
//         console.error("Error getting token:", error);
//     }
// };

// getDeviceToken();

// // Handle foreground messages
// onMessage(messaging, (payload) => {
//     console.log('Message received: ', payload);
//     const { title, body } = payload.notification;
//     const notificationOptions = {
//         body,
//         icon: '/firebase-logo.png'
//     };
//     new Notification(title, notificationOptions);
// });

// export const messaging = getMessaging(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

