import { NextResponse } from 'next/server';
import { toast } from "react-toastify";
const jwt = require('jsonwebtoken');
const moment = require('moment');
import { jwtDecode } from 'jwt-decode';

// capitalize first letter
export const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Generate slug
export const generateSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Toast message
export const showToast = (success, message) => {
    if (success) {
        toast.success(message, {
            position: "top-center",
            hideProgressBar: false,
            theme: "dark",
        });
    }
};

// Extract Token Data
export const extractTokenData = (headers) => {
    const authHeader = headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ result: false, message: "Authorization header is missing or malformed" });
    }
    const token = authHeader.replace('Bearer ', '');
    return jwt.verify(token, process.env.JWT_SECRET).userDetail;
}

// Convert image to base64
export const base64ToFile = (base64String, filename) => {
    const [metadata, base64Data] = base64String.split(',');
    const mimeType = metadata.match(/:(.*?);/)[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });
    return file;
};

// Check the date is today or not for email
export const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

// Caps String
export const convertStrToUpper = (str) => {
    if (!str) return '';
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const getDate = (timestamp) => {
    const date = moment(timestamp);
    return date.format('DD-MM-YYYY');
}

export const sessionUserDetail = () => {
    const token = sessionStorage.getItem('token');
    return jwtDecode(token);
}
export const stripHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
};
