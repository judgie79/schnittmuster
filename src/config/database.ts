import { Sequelize } from "sequelize";
import { environment } from "./environment";
import logger from "@shared/utils/logger";

export const sequelize = new Sequelize(
  environment.database.name,
  environment.database.username,
  environment.database.password,
  {
    host: environment.database.host,
    port: environment.database.port,
    dialect: "postgres",
    logging: environment.database.logging ? (msg) => logger.debug(msg) : false,
  }
);

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info("Sequelize connection established");
  } catch (error) {
    logger.error("Unable to connect to database", error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  await sequelize.close();
  logger.info("Sequelize connection closed");
}
