// scripts/updateConfig.ts
import { promises as fs } from "fs";

const CONFIG_FILE = "./config.json";

export async function updateConfig(network: string, key: string, value: string) {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    const config = JSON.parse(raw);

    if (!config[network]) config[network] = {};
    config[network][key] = value;

    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`✅ Updated config: ${network}.${key} = ${value}`);
  } catch (err) {
    console.error("❌ Failed to update config:", err);
  }
}