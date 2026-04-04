import dotenv from "dotenv";
import path from "path";
import { Resend } from "resend";

dotenv.config({ path: path.join(process.cwd(), "../../.env") });

let client: Resend;

export const getResendClient = (): Resend => {
    if (!client) {
        client = new Resend(process.env.RESEND_API_KEY!);
    }
    return client;
};