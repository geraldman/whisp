import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function generateUniqueNumericId(): Promise<string> {
  while (true) {
    const numericId = Math.floor(
      10000000 + Math.random() * 90000000
    ).toString();

    const ref = doc(db, "user_numeric_index", numericId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return numericId;
    }
  }
}
