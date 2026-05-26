
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Order Service Api",
    description: "Automatically generated Swagger docs.",
    version: "1.0.0"
  },
  host: "localhost:6004",
  schemes: ["http"],
  basePath: "/api"
}

const outputFile = "./swagger-output.json"
const endPointsFiles = ["./routes/order.route.ts"]

swaggerAutogen(outputFile, endPointsFiles, doc);
