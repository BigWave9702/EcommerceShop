import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import router from "./routes/user.route";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to user-service!" });
});

//Routes
app.use("/api", router);

app.use(errorMiddleware);

const port = process.env.PORT || 6009;

const server = app.listen(port, () => {
  console.log(`User Service is running at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.log("Server error: ", err);
});
