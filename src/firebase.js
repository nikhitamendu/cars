import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbVG4NXjWmoY8gHaqYsisXMicgWKQ7m8Q",
  authDomain: "car-client-f59f0.firebaseapp.com",
  projectId: "car-client-f59f0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
