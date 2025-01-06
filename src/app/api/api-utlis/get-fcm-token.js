import { getToken } from '@firebase/messaging';
import { messaging } from '@/app/firebaseConfig';
import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import { responseData } from '@/utils/message';

const useDeviceToken = () => {
    const [deviceToken, setDeviceToken] = useState("");
    const [vapidKey, setVapidKey] = useState("");

    const getVapidKey = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/push-notification');
            if (response.data.result) {
                setVapidKey(response.data.message.vapidKey);
            } else {
                console.error("Failed to retrieve VAPID key:", response.data.error);
            }
        } catch (error) {
            console.error("Error fetching VAPID key:", error);
        }
    }, []);

    const requestNotificationPermission = async () => {
        let permission = Notification.permission;
        if (permission === 'denied') {
            alert(responseData.notificationEnableMsg);
        }
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
        return permission === 'granted';
    };

    const getDeviceToken = async (vapidKey) => {
        if (typeof window !== 'undefined' && messaging && 'serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered with scope:', registration.scope);
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
                const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
                console.log('Token:', token);
                return token;
            } else {
                console.error("Permission not granted for notifications.");
            }
        }
    };

    useEffect(() => {
        const fetchToken = async () => {
            await getVapidKey();
            if (vapidKey) {
                const token = await getDeviceToken(vapidKey);
                setDeviceToken(token);
            }
        };
        fetchToken();
    }, [vapidKey, getVapidKey]);

    return deviceToken;
};

export default useDeviceToken;
