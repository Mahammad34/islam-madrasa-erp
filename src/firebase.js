import { initializeApp } from "firebase/app";

import {
  getFirestore
} from "firebase/firestore";

import {
  getAuth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAu7UvX-yf0SQC2NbwcIgnsIxvMF_FW02w",
  authDomain: "islam-madrasa-erp.firebaseapp.com",
  projectId: "islam-madrasa-erp",
  storageBucket: "islam-madrasa-erp.firebasestorage.app",
  messagingSenderId: "565290719685",
  appId: "1:565290719685:web:979d3a0c4064cfd8b6d3ac"
};

const app =
  initializeApp(
    firebaseConfig
  );

export const db =
  getFirestore(
    app
  );

export const auth =
  getAuth(
    app
  );

export default app;