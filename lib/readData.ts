import { FileSystem } from "@effect/platform";
import { Data, Effect, Schema } from "effect";

const RaffleData = Schema.Struct({
  ProjectItems: Schema.Array(
    Schema.Struct({
      ApplicationStartDate: Schema.DateFromString,
      ApplicationEndDate: Schema.DateFromString,
      LotteryDate: Schema.DateFromString,
      CityDescription: Schema.String,
      LotteryApparmentsNum: Schema.Number,
      TotalSubscribers: Schema.Number,
      TotalLocalSubscribers: Schema.Number,
      TotalHandicappedSubscribers: Schema.Number,
      TotalReservedDutySubscribers: Schema.Number,
      HousingUnitsForHandicapped: Schema.OptionFromNullOr(Schema.Number),
      LocalHousing: Schema.OptionFromNullOr(Schema.Number),
      PricePerUnit: Schema.Number,
    }),
  ),
});

export type RaffleData = Schema.Schema.Type<typeof RaffleData>;

export const readData = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const data = yield* fs.readFileString("./data.json", "utf-8");
  const parsedJson = yield* Effect.try(() => JSON.parse(data)).pipe(
    Effect.catchTag(
      "UnknownException",
      (e) => new JsonParseError({ msg: e.message }),
    ),
  );
  const parsedData = yield* Schema.decodeUnknown(RaffleData)(parsedJson);

  return parsedData;
});

class JsonParseError extends Data.TaggedError("JsonParseError")<{
  msg: string;
}> {}
