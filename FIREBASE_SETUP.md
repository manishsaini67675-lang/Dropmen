# Dropmen Firebase Online Orders

This project is prepared for online customer orders and an Admin Orders panel.

## Required once
1. Create a Firebase project at https://console.firebase.google.com/
2. Add a Web App and copy its Firebase configuration.
3. Open `app/src/main/assets/index.html` and replace the `YOUR_*` values in `FIREBASE_CONFIG`.
4. Create a Firestore database.
5. For initial testing, create a Firestore rule that allows the app to read/write `orders`. **Do not publish with open rules.** For production, use Firebase Authentication and secure Firestore rules so only the owner can update orders.
6. Build the signed Android App Bundle (AAB).

When configured, new orders are written to the `orders` collection. Admin Orders refreshes from Firestore and status changes are written back.

The current demo admin password remains `Dropmen@123`; this client-side password is NOT secure for a production release. Replace it with Firebase Authentication before publishing.
