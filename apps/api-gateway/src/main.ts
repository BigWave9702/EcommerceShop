import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import cookieParser from "cookie-parser";
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

//Apply rate limiting (skipped outside production so local dev — with its
//many parallel unauthenticated fetches per page load and Fast Refresh
//remounts — never gets locked out for the rest of the window)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 2000 : 500),
  message: { error: "Too many request, please try again later!" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => ipKeyGenerator(req.ip as string),
  skip: () => process.env.NODE_ENV !== "production",
});

app.use(limiter);

app.use("/logger", proxy("http://localhost:6008"));
app.use("/recommendation", proxy("http://localhost:6007"));
app.use("/chatting", proxy("http://localhost:6006"));
app.use("/order", proxy("http://localhost:6004"));
app.use("/admin", proxy("http://localhost:6005"));
app.use("/seller", proxy("http://localhost:6003"));
app.use("/product", proxy("http://localhost:6002"));
app.use("/user", proxy("http://localhost:6009"));
app.use("/", proxy("http://localhost:6001"));

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site config initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize site config:", error);
  }
});
server.on("error", console.error);
