const DISCORD_URL =
  process.env.NODE_ENV === "development"
    ? "https://discord.com/oauth2/authorize?client_id=1276926372392210483&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fwelcome&scope=identify"
    : "https://discord.com/oauth2/authorize?client_id=1276926372392210483&response_type=code&redirect_uri=https%3A%2F%2Ftype.city%2Fwelcome&scope=identify";

export { DISCORD_URL };
