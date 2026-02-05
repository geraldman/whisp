// app/actions/searchUser.ts
"use server";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function searchUserByNumericId(numericId: string) {
  const indexSnap = await getDoc(
    doc(db, "user_numeric_index", numericId)
  );

  if (!indexSnap.exists()) return { found: false };

  const { uid } = indexSnap.data();

  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) throw new Error("Corrupt index");

  const data = userSnap.data();

  return {
    found: true,
    user: {
      uid: data.uid,
      numericId: data.numericId,
      username: data.username,
    },
  };
}
