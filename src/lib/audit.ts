import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type AuditAction = 
  | "ORDER_PLACED"
  | "ORDER_STATUS_UPDATED"
  | "PAYMENT_STATUS_UPDATED"
  | "PRODUCT_ADDED"
  | "PRODUCT_EDITED"
  | "PRODUCT_DELETED"
  | "ORDER_UPDATED"
  | "REPAYMENT_SUBMITTED"
  | "BULK_UPLOAD";

export const logSystemEvent = async (action: AuditAction, details: string, userId: string = "system") => {
  try {
    await addDoc(collection(db, "auditLogs"), {
      action,
      details,
      userId,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
