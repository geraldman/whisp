// app/actions/searchUser.ts
"use server";

import { adminDb } from "@/lib/firebase/firebaseAdmin";

export async function searchUserByNumericId(numericId: string) {
  const indexSnap = await adminDb
    .collection("user_numeric_index")
    .doc(numericId)
    .get();

  if (!indexSnap.exists) return { found: false };

  const { uid } = indexSnap.data() as { uid: string };

  const userSnap = await adminDb.collection("users").doc(uid).get();
  if (!userSnap.exists) throw new Error("Corrupt index");

  const data = userSnap.data() as {
    uid: string;
    numericId: string;
    username: string;
  };

  return {
    found: true,
    user: {
      uid: data.uid,
      numericId: data.numericId,
      username: data.username,
    },
  };
}
