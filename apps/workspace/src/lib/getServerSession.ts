import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getServerSession();
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  
  return session;
}
