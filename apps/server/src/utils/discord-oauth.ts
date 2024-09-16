import dotenv from "dotenv";
dotenv.config();
const D_API_ENDPOINT = "https://discord.com/api/v10";
// todo: set this based on env
const WEB_REDIRECT_URI = process.env.REDIRECT_URI;

type ATResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  scope: string;
};

type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration?: string | null;
};

async function exchangeCode(code: string): Promise<ATResponse> {
  const payload = {
    grant_type: "authorization_code",
    code,
    redirect_uri: WEB_REDIRECT_URI,
    client_id: process.env.D_CLIENT_ID!,
    client_secret: process.env.D_CLIENT_SECRET!,
  };
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const res = await fetch(`${D_API_ENDPOINT}/oauth2/token`, {
    method: "POST",
    headers,
    body: new URLSearchParams(payload),
  });

  const json = (await res.json()) as ATResponse;
  console.log({ json });

  return json;
}

async function refreshToken(refreshToken: string): Promise<ATResponse> {
  const payload = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const res = await fetch(`${D_API_ENDPOINT}/oauth2/token`, {
    method: "POST",
    headers,
    body: new URLSearchParams(payload),
  });

  const json = (await res.json()) as ATResponse;
  // console.log({ json });
  return json;
}

async function me(accessToken: string): Promise<DiscordUser> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const res = await fetch(`${D_API_ENDPOINT}/users/@me`, { headers });

  const json = (await res.json()) as DiscordUser;

  if (json.message?.includes("401")) {
    throw new Error("invalid /me");
  }
  // console.log({ json });

  return json;
}

const discord = {
  refreshToken,
  exchangeCode,
  me,
};

export { discord };
