import fs from "fs";
import path from "path";

type LogType = "info" | "error" | "warning" | "success" | "debug";

interface SendLogProps {
  type?: LogType;
  message: string;
  source?: string;
}

export const sendLog = async ({
  type = "info",
  message,
  source = "unknown-service",
}: SendLogProps): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();

    const logMessage = `[${timestamp}] [${type.toUpperCase()}] [${source}] ${message}`;

    // console
    switch (type) {
      case "error":
        console.error(logMessage);
        break;

      case "warning":
        console.warn(logMessage);
        break;

      case "success":
        console.log("✅", logMessage);
        break;

      case "debug":
        console.debug(logMessage);
        break;

      default:
        console.log(logMessage);
    }

    // save file log
    const logsDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    const logFile = path.join(logsDir, `${source}.log`);

    fs.appendFileSync(logFile, logMessage + "\n");
  } catch (error) {
    console.error("Logging failed:", error);
  }
};
