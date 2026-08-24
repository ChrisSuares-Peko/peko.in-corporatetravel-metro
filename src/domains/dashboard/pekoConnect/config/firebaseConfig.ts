// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyBJWdpwoYS2bvcw0cEfLc1WxkEKaip1H6M',
    authDomain: 'peko-in.firebaseapp.com',
    projectId: 'peko-in',
    storageBucket: 'peko-in.firebasestorage.app',
    messagingSenderId: '247764454257',
    appId: '1:247764454257:web:dfebb7eae6b6974457c4d0',
    measurementId: 'G-R30G82463G',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const firestore = getFirestore(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
