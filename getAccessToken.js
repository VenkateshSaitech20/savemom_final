const { GoogleAuth } = require('google-auth-library');
const path = require('path');

async function getAccessToken() {
    const auth = new GoogleAuth({
        keyFile: path.join(__dirname, '/src/app/api/token/savemom-1fb50-firebase-adminsdk-fzgr5-653f873897.json'),
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log('Access Token:', accessToken.token);
}

getAccessToken().catch(console.error);
