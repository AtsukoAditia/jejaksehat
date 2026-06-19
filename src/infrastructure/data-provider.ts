export type DataProvider = "sheets" | "postgres";

export function getDataProvider(): DataProvider {
  const provider = process.env.DATA_PROVIDER ?? "sheets";

  if (provider !== "sheets" && provider !== "postgres") {
    throw new Error(
      `Unsupported DATA_PROVIDER: ${provider}. Use "sheets" or "postgres".`,
    );
  }

  return provider;
}
