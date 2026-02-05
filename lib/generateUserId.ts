import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function generateUniqueNumericId(): Promise<string> {
  return await runTransaction(db, async (transaction) => {
    while (true) {
      const numericId = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();

      const ref = doc(db, "user_numeric_index", numericId);
      const snap = await transaction.get(ref);

      if (!snap.exists()) {
        transaction.set(ref, {
          createdAt: Date.now(),
        });
        return numericId;
      }
    }
  });
}
