import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { loadConfig } from "@restaurantos/config";
import { AppModule } from "./app.module.js";
import { GlobalErrorFilter } from "./error.filter.js";

async function bootstrap(): Promise<void> {
  // Fail fast on invalid/missing configuration (spec §17.1).
  const config = loadConfig();

  const app = await NestFactory.create(AppModule.forRoot(config), {
    logger: ["error", "warn", "log"],
  });

  app.setGlobalPrefix("v1");
  app.useGlobalFilters(new GlobalErrorFilter());
  app.enableShutdownHooks();

  await app.listen(config.API_PORT);
}

void bootstrap();
