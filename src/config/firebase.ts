import { app } from "@/services/firebase";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firestore = db;
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;



