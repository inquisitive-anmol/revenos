import Nylas from "nylas";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../../.env") });

let nylasClient: InstanceType<typeof Nylas>;

export const getNylasClient = (): InstanceType<typeof Nylas> => {
  if (!nylasClient) {
    nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
    });
  }
  return nylasClient;
};