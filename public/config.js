// config.js - Central de Conexión J.A.D.I REPAIZ
const firebaseConfig = {
  apiKey: "AIzaSyAKPxGtonv8Ynwj-PsmwjrkX-JN_KMSSyt",
  authDomain: "jadi-repaiz.firebaseapp.com",
  databaseURL: "https://jadi-repaiz-default-rtdb.firebaseio.com",
  projectId: "jadi-repaiz",
  storageBucket: "jadi-repaiz.firebasestorage.app",
  messagingSenderId: "847134630000",
  appId: "1:847134630000:web:0b780eaeda63b991d554b5"
};

// Inicialización de Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Variables globales para que funcionen en todos tus archivos
const auth = firebase.auth();
const db = firebase.database();
