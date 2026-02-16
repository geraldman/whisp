# Firebase Realtime Database Setup Instructions

## Steps to Enable Realtime Database

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `whispxr-1ad6e`

2. **Enable Realtime Database**
   - In the left sidebar, click "Realtime Database"
   - Click "Create Database"
   - Choose location (same as your Firestore region if possible)
   - Start in **test mode** initially, we'll deploy secure rules after

3. **Get Database URL**
   - Once created, you'll see the database URL at the top
   - Format: `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com`
   - Or: `https://YOUR-PROJECT-ID-default-rtdb.REGION.firebasedatabase.app`

4. **Add to Environment Variables**
   - Open your `.env.local` file
   - Add this line:
   ```
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://YOUR-DATABASE-URL.firebaseio.com
   ```
   - Replace with your actual database URL from step 3

5. **Deploy Security Rules**
   - In Firebase Console, go to Realtime Database → Rules tab
   - Copy the contents of `database.rules.json`
   - Paste into the rules editor
   - Click "Publish"

6. **Restart Development Server**
   ```bash
   npm run dev
   ```

## What Changed

- **Before**: Used Firestore + 5-minute polling for presence
- **Now**: Uses Realtime Database with native disconnect detection
- **Benefits**:
  - ✅ Instant offline detection (no 5-minute delay)
  - ✅ No polling - server automatically detects disconnects
  - ✅ More reliable (detects tab close, internet loss, crashes)
  - ✅ Industry standard for presence systems

## Files Modified

- `lib/firebase/firebase.ts` - Added Realtime Database
- `lib/hooks/useUserPresence.ts` - Uses RTDB with `onDisconnect()`
- `app/components/ChatList.tsx` - Reads presence from RTDB
- `app/actions/logout.ts` - Updates RTDB on logout
- `database.rules.json` - Security rules for RTDB
- `firestore.rules` - Removed Firestore presence rules

## How It Works

1. **Login**: User presence set to online in RTDB
2. **Active**: Connection maintained automatically
3. **Disconnect**: Firebase server automatically sets offline via `onDisconnect()`
4. **Real-time**: Chat list shows status changes instantly
5. **No polling**: Everything is push-based

## Troubleshooting

If you see errors about "database URL":
- Make sure you added `NEXT_PUBLIC_FIREBASE_DATABASE_URL` to `.env.local`
- Restart the dev server after adding the variable
- Verify the URL format from Firebase Console
