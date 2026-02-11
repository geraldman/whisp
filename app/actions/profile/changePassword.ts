"use client";

import { auth } from "@/lib/firebase/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export async function changePassword(newPassword: string, currentPassword?: string) {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("Not authenticated");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password harus minimal 6 karakter");
  }

  try {
    // Update password using Firebase Client SDK
    await updatePassword(user, newPassword);

    return { success: true };
  } catch (error: any) {
    console.error("Change password error:", error);
    
    // If requires recent login, throw specific error
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Untuk keamanan, silakan logout dan login kembali sebelum mengubah password.");
    }
    
    throw new Error("Gagal mengubah password. Silakan coba lagi.");
  }
}
