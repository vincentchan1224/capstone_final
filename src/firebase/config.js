import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAN6ojY062fIlqmpgtYvyHlOjgk2JObX4o",
  authDomain: "tggame-feb49.firebaseapp.com",
  projectId: "tggame-feb49",
  storageBucket: "tggame-feb49.appspot.com",
  messagingSenderId: "500774285896",
  appId: "1:500774285896:web:1d2f62f9e2c2101f189e7d",
  measurementId: "G-K1HWWRZFGS",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
