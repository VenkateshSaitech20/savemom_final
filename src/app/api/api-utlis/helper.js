import { registerData, responseData } from '@/utils/message';
import fs from 'fs';
const path = require('path');

const allowedTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
const maxSize = process.env.NEXT_PUBLIC_MAX_FILE_SIZE;

// File upload
export const writeFile = (filePath, buffer) => {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                reject(new Error(`Failed to write file: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
};

// Delete image
export const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(new Error(`Failed to delete file at ${filePath}: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
};

// Delete fields
export const deleteFields = (obj, fields) => {
    fields.forEach(field => {
        delete obj[field];
    });
};

// For array data
export const deleteArrayFields = (arr, fields) => {
    arr.forEach(obj => {
        fields.forEach(field => {
            delete obj[field];
        });
    });
};

// Save Image file
export const saveFile = async (file, uploadDir, urlDir) => {
    if (!file) return '';
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = Date.now() + '_' + file.name.replace(/\s+/g, '_');
    const filePath = path.join(process.cwd(), uploadDir, fileName);
    await writeFile(filePath, buffer);
    return `${process.env.NEXT_PUBLIC_APP_URL}/${urlDir}/${fileName}`;
};

// Get image file url
export const getFilePathFromUrl = (url, baseDir) => {
    const filePathRelative = url.replace(/^https?:\/\/[^\/]+/, '');
    return path.join(process.cwd(), baseDir, filePathRelative);
};

// Validate Image
export const validateImage = (file) => {
    if (!file) return { isValid: true };
    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: responseData.invalidFileType };
    }
    if (file.size > maxSize) {
        return { isValid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB.` };
    }
    return { isValid: true };
};

// Validate input Text
export const validateText = (text, type, validateMessage) => {
    let regex;
    let maxLength;
    let minLength;
    let lengthMessage;
    let message;
    switch (type) {
        case 'name':
            regex = /^(?=.*[a-zA-Z])[a-zA-Z ]*$|^$/;
            maxLength = 200;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'number':
            regex = /^\d*$/;
            maxLength = 50;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'mobileNumber':
            regex = /^(?!0)\d*(?:\.\d+)?$/;
            maxLength = 10;
            minLength = 10;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'description':
            regex = /^[a-zA-Z0-9 .,?+-]*$/;
            maxLength = 500;
            lengthMessage = `Description must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'nameWithDot':
            // regex = /^(?=.*[a-zA-Z])[a-zA-Z. ]*$|^$/;        // nameWithDot
            regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/,&-]*$|^$/; // Description
            maxLength = 500;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'address':
            regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/,&-]*$|^$/;
            maxLength = 200;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'email':
            regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            maxLength = 50;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'metaTag':
            regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/,&-]*$|^$/;
            maxLength = 200;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'rating':
            regex = /^[1-5]$/;
            maxLength = 1;
            lengthMessage = registerData.ratingFieldVal;
            message = validateMessage;
            break;
        case 'question':
            regex = /^(?=.*[a-zA-Z])[a-zA-Z ?]*$|^$/;
            maxLength = 200;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'keyMatric':
            regex = /^[a-zA-Z0-9\s.,()'"\/,&%+-]*$|^$/;
            maxLength = 50;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'title':
            // regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/,&-]*$|^$/;
            // regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/&?:;"'’-]*$|^$/;
            // regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/&?:;’‘"“”-!]*$|^$/;
            regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/&?:;’‘"“”\-!]*$|^$/;
            maxLength = 200;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'shortContent':
            regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/,&-]*$|^$/; // Description
            maxLength = 300;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'descriptionXL':
            regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,()'"\/,&-]*$|^$/; // Description
            maxLength = 3000;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'shortname':
            regex = /^[a-zA-Z]{2,3}$/;
            maxLength = 3;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'discount':
            regex = /^(100|[1-9][0-9]?|[1-9])$/;  // Matches 1-99 or 100
            maxLength = 3;
            lengthMessage = registerData.discountFieldVal;
            message = validateMessage;
            break;
        case 'customMobileNumber':
            regex = /^\+?(?!0)\d*(?:\.\d+)?$/;
            maxLength = 15;
            minLength = 10;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        case 'phoneCode':
            regex = /^\+?(?!0)\d*(?:\.\d+)?$/;
            maxLength = 15;
            minLength = 2;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage;
            break;
        default:
            regex = /^[a-zA-Z\s]*$/;
            maxLength = 100;
            lengthMessage = `Field must not exceed ${maxLength} characters`;
            message = validateMessage || 'Invalid input. Only letters and spaces are allowed.';
    }

    // For mobile number
    if (text.length < minLength) {
        return { valid: false, message: `Mobile number must be exactly ${minLength} digits` };
    }

    if (text.length > maxLength) {
        return { valid: false, message: lengthMessage };
    }

    if (!regex.test(text)) {
        return { valid: false, message };
    }

    return { valid: true, message: null };
};

// Validate input fields
export const validateFields = (fields, validationTypes) => {
    const fieldErrors = {};
    Object.entries(validationTypes).forEach(([fieldName, { type, message }]) => {
        const fieldValue = fields[fieldName];
        if (fieldValue !== undefined) {
            const { valid, message: validationMessage } = validateText(fieldValue, type, message);
            if (!valid) {
                fieldErrors[fieldName] = validationMessage;
            }
        }
    });

    return fieldErrors;
};

// Save image files
export const processFiles = async (files, uploadDir, urlDir) => {
    const profileImageUrls = {};
    const errors = {};

    const filteredFiles = Object.entries(files).filter(([key, file]) => file !== null);

    const validationResults = await Promise.all(filteredFiles.map(async ([key, file]) => {
        const validation = validateImage(file);
        return { key, file, validation };
    }));

    for (const { key, validation } of validationResults) {
        if (!validation.isValid) {
            errors[key] = validation.error;
        }
    }

    if (Object.keys(errors).length > 0) {
        return { profileImageUrls, errors };
    }

    for (const { key, file } of validationResults) {
        profileImageUrls[key] = await saveFile(file, uploadDir, urlDir);
    }

    return { profileImageUrls, errors };
};

export const areAllPermissionsEmpty = (permissions) => {
    return Object.values(permissions).every(array => Array.isArray(array) && array.length === 0);
};

export const removeHtmlTagsExceptBr = (htmlString) => {
    return htmlString
        .replace(/<br\s*\/?>/g, '\n') // Replace <br/> with newline
        .replace(/<\/?[^>]+(>|$)/g, ''); // Remove all other HTML tags
};

export const getDate = (timestamp) => {
    const date = moment(timestamp);
    return date.format('DD-MM-YYYY');
}
