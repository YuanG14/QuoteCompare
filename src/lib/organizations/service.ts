import type { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import type {
  Organization,
  OrganizationMembership,
  OrganizationRole,
  WorkspaceUserProfile,
} from "@/types/organization";

export type LoadedOrganizationContext = {
  profile: WorkspaceUserProfile;
  organization: Organization;
  membership: OrganizationMembership;
};

function normalizeOrganizationName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function readString(data: DocumentData, key: string): string {
  return typeof data[key] === "string" ? data[key] : "";
}

function readRole(data: DocumentData): OrganizationRole {
  const role = data.role;
  if (
    role === "admin" ||
    role === "procurement_manager" ||
    role === "procurement_staff" ||
    role === "viewer"
  ) {
    return role;
  }
  return "viewer";
}

export async function createOrganizationForUser(user: User, name: string): Promise<string> {
  if (!user.emailVerified) throw new Error("Verify your email before creating an organization workspace.");

  const db = getFirebaseFirestore();
  const organizationRef = doc(collection(db, "organizations"));
  const membershipRef = doc(db, "organizations", organizationRef.id, "members", user.uid);
  const profileRef = doc(db, "users", user.uid);
  const cleanName = name.trim().replace(/\s+/g, " ");
  const email = user.email?.trim().toLowerCase() ?? "";
  const displayName = user.displayName?.trim() || email.split("@")[0] || "Workspace member";
  const batch = writeBatch(db);

  batch.set(organizationRef, {
    name: cleanName,
    normalizedName: normalizeOrganizationName(cleanName),
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(membershipRef, {
    organizationId: organizationRef.id,
    userId: user.uid,
    email,
    displayName,
    role: "admin",
    status: "active",
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(
    profileRef,
    {
      uid: user.uid,
      email,
      displayName,
      activeOrganizationId: organizationRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  return organizationRef.id;
}

export async function loadOrganizationContext(user: User): Promise<LoadedOrganizationContext | null> {
  const db = getFirebaseFirestore();
  const profileSnapshot = await getDoc(doc(db, "users", user.uid));
  if (!profileSnapshot.exists()) return null;

  const profileData = profileSnapshot.data();
  const activeOrganizationId = readString(profileData, "activeOrganizationId") || null;
  if (!activeOrganizationId) return null;

  const [organizationSnapshot, membershipSnapshot] = await Promise.all([
    getDoc(doc(db, "organizations", activeOrganizationId)),
    getDoc(doc(db, "organizations", activeOrganizationId, "members", user.uid)),
  ]);

  if (!organizationSnapshot.exists() || !membershipSnapshot.exists()) {
    throw new Error("Your account points to an organization that is unavailable. Ask an administrator to restore your membership or contact support.");
  }

  const organizationData = organizationSnapshot.data();
  const membershipData = membershipSnapshot.data();
  if (readString(membershipData, "status") !== "active") {
    throw new Error("Your organization membership is not active.");
  }

  return {
    profile: {
      uid: user.uid,
      email: readString(profileData, "email") || user.email || "",
      displayName: readString(profileData, "displayName") || user.displayName || "Workspace member",
      activeOrganizationId,
    },
    organization: {
      id: organizationSnapshot.id,
      name: readString(organizationData, "name") || "Organization",
      normalizedName: readString(organizationData, "normalizedName"),
      createdBy: readString(organizationData, "createdBy"),
    },
    membership: {
      organizationId: activeOrganizationId,
      userId: readString(membershipData, "userId") || user.uid,
      email: readString(membershipData, "email") || user.email || "",
      displayName: readString(membershipData, "displayName") || user.displayName || "Workspace member",
      role: readRole(membershipData),
      status: "active",
    },
  };
}

export async function listOrganizationMembers(organizationId: string): Promise<OrganizationMembership[]> {
  const db = getFirebaseFirestore();
  const snapshot = await getDocs(collection(db, "organizations", organizationId, "members"));

  return snapshot.docs
    .map((memberSnapshot) => {
      const data = memberSnapshot.data();
      const status = readString(data, "status");
      return {
        organizationId,
        userId: readString(data, "userId") || memberSnapshot.id,
        email: readString(data, "email"),
        displayName: readString(data, "displayName") || "Workspace member",
        role: readRole(data),
        status: status === "suspended" ? "suspended" as const : "active" as const,
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function renameOrganization(organizationId: string, name: string): Promise<void> {
  const cleanName = name.trim().replace(/\s+/g, " ");
  await updateDoc(doc(getFirebaseFirestore(), "organizations", organizationId), {
    name: cleanName,
    normalizedName: normalizeOrganizationName(cleanName),
    updatedAt: serverTimestamp(),
  });
}
