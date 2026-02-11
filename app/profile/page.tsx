"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { getUserProfile } from "@/app/actions/profile/getUserProfile";
import ProfileInfo from "@/app/components/profile/ProfileInfo";
import ProfileAvatar from "@/app/components/profile/ProfileAvatar";
import ProfileQR from "@/app/components/profile/ProfileQR";
import ProfileSecurity from "@/app/components/profile/ProfileSecurity";
import DangerZone from "@/app/components/profile/DangerZone";

export default function ProfilePage() {
  const { user } = useRequireAuth();
  const [avatar, setAvatar] = useState("/window.svg");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Load profile data from Firestore
    getUserProfile(user.uid)
      .then((data) => {
        setProfileData(data);
        setAvatar(data.avatar);
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.uid]);

  if (!user || loading) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: 24, textAlign: "center" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: 24, textAlign: "center" }}>
        <p style={{ color: "red" }}>Failed to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 24 }}>
      <h2>Profile</h2>

      <ProfileAvatar uid={user.uid} avatar={avatar} onChange={setAvatar} />
      <ProfileInfo user={profileData} />
      <ProfileQR numericId={profileData.numericId} />
      <ProfileSecurity />
      <DangerZone />
    </div>
  );
}
