import Nylas from "nylas";

let nylasClient: Nylas;

export const getNylasClient = (): Nylas => {
  if (!nylasClient) {
    nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
    });
  }
  return nylasClient;
};