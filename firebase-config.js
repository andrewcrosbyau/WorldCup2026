// WC2026 Trip Planner — Firebase configuration
// ─────────────────────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com and create a project
// 2. Add a Web app (</> icon) — call it "WC2026"
// 3. Copy the firebaseConfig object values below
// 4. In Firestore Database → Rules, paste:
//
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /trips/wc2026 {
//            allow read, write: if true;
//          }
//        }
//      }
//
// 5. Save the rules and redeploy / refresh the page
// ─────────────────────────────────────────────────────────────
window.FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
