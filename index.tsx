import {
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import { BunContext, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Console, Effect, Layer, Option } from "effect";
import { IndexPage } from "./templates";
import { getFileAnalysis } from "./lib/analyze";
import { Table } from "./templates/Table";

const router = HttpRouter.empty
  .pipe(
    HttpRouter.get("/ping", HttpServerResponse.text("pong")),
    HttpRouter.get(
      "/",
      Effect.flatMap(HttpServerRequest.HttpServerRequest, (req) =>
        Effect.gen(function* () {
          return HttpServerResponse.html(
            (
              <IndexPage
                tableData={yield* getFileAnalysis}
                searchParams={req.url.split("?")[1] ?? ""}
              />
            ) as string,
          );
        }),
      ),
    ),
    HttpRouter.get(
      "/templates/table",
      Effect.flatMap(HttpServerRequest.HttpServerRequest, (req) =>
        Effect.gen(function* () {
          let items = yield* getFileAnalysis;
          // @ts-expect-error
          const query = new URLSearchParams(req.url.split("?")[1]);
          const years = query.getAll("year");
          if (query.getAll("year").length) {
            items = items.filter((i) =>
              years.includes(i.lotteryDate.getUTCFullYear().toString()),
            );
          }
          if (query.get("cityName")) {
            items = items.filter((i) =>
              i.cityName
                .toLowerCase()
                .includes(query.get("cityName")?.toLowerCase() ?? ""),
            );
          }
          if (query.get("sort")) {
            const dir = query.get("sortDir") === "asc" ? 1 : -1;
            switch (query.get("sort")) {
              case "cityName": {
                items.sort(
                  (a, b) =>
                    dir * a.cityName.localeCompare(b.cityName) ||
                    dir * (a.lotteryDate.valueOf() - b.lotteryDate.valueOf()),
                );
                break;
              }
              case "lotteryDate": {
                items.sort(
                  (a, b) =>
                    dir * (a.lotteryDate.valueOf() - b.lotteryDate.valueOf()),
                );
                break;
              }
              case "lotteriesConducted": {
                items.sort((a, b) => dir * (a.lotteriesNum - b.lotteriesNum));
                break;
              }
              case "medianPrice": {
                items.sort(
                  (a, b) =>
                    dir *
                    (a.medianPrice.pipe(Option.getOrElse(() => 0)) -
                      b.medianPrice.pipe(Option.getOrElse(() => 0))),
                );
                break;
              }
              case "medianProbability": {
                items.sort(
                  (a, b) =>
                    dir *
                    (a.medianProbability.pipe(Option.getOrElse(() => 0)) -
                      b.medianProbability.pipe(Option.getOrElse(() => 0))),
                );
                break;
              }
              case "probabilityToWinInAtLeastOne": {
                items.sort(
                  (a, b) =>
                    dir *
                    (parseFloat(a.probabilityToWinInAtLeastOne) -
                      parseFloat(b.probabilityToWinInAtLeastOne)),
                );
              }
            }
          }
          return HttpServerResponse.html(
            (
              <Table
                tableItems={items}
                sortDir={query.get("sortDir") ?? undefined}
                sortCol={query.get("sort") ?? undefined}
              />
            ) as string,
          );
        }),
      ),
    ),
    HttpRouter.get(
      "/static/*",
      Effect.flatMap(HttpServerRequest.HttpServerRequest, (req) =>
        Effect.gen(function* () {
          return yield* HttpServerResponse.file("." + req.url);
        }),
      ),
    ),
  )
  .pipe(
    Effect.catchAllDefect((def) =>
      Effect.gen(function* () {
        yield* Console.log("Defect happened: ", def);
        return HttpServerResponse.setStatus(500)(HttpServerResponse.empty());
      }),
    ),
    Effect.catchAll((e) =>
      Effect.gen(function* () {
        yield* Console.log("error happened: ", e);
        return HttpServerResponse.setStatus(500)(HttpServerResponse.empty());
      }),
    ),
  );

const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

const port = 8080;

const ServerLive = BunHttpServer.layer({ port });

BunRuntime.runMain(
  Layer.launch(
    app.pipe(Layer.provide(ServerLive), Layer.provide(BunContext.layer)),
  ),
);
