import { Console, Effect, Option } from "effect";
import { readData, type RaffleData } from "./readData";

export type FileAnalysis =
  typeof getFileAnalysis extends Effect.Effect<infer A, any, any> ? A : never;

export const getFileAnalysis = Effect.gen(function* () {
  const data = yield* readData;
  const lotteriesByLocalityAndDate = Object.groupBy(
    data.ProjectItems,
    (pitem) =>
      pitem.CityDescription +
      new Date(
        pitem.LotteryDate.getFullYear(),
        pitem.LotteryDate.getUTCMonth(),
        pitem.LotteryDate.getUTCDate(),
      ),
  );

  const processedData = Object.values(lotteriesByLocalityAndDate)
    .map(
      (lotteries) =>
        lotteries?.[0] && {
          cityName: lotteries[0].CityDescription,
          lotteryDate: lotteries[0].LotteryDate,
          lotteriesNum: lotteries.length,
          medianPrice: median(lotteries.map((l) => l.PricePerUnit)),
          pribabilities: lotteries.map(lotteryWinProbability),
          medianProbability: median(lotteries.map(lotteryWinProbability)),
          probabilityToWinInAtLeastOne:
            (
              100 *
              (1 -
                lotteries
                  .map(lotteryWinProbability)
                  .reduce((acc, p) => acc * (1 - p), 1))
            ).toFixed(2) + "%",
        },
    )
    .filter(<T>(t: T | undefined): t is T => !!t)
    .filter((t) =>
      t.medianPrice.pipe(
        Option.map((i) => i > 0),
        Option.getOrElse(() => false),
      ),
    )
    .toSorted((a, b) => {
      const prob =
        parseFloat(b.probabilityToWinInAtLeastOne) -
        parseFloat(a.probabilityToWinInAtLeastOne);
      if (prob != 0) return prob;

      return b.lotteryDate.valueOf() - a.lotteryDate.valueOf();
    });
  return processedData;
}).pipe(
  Effect.catchAll((e) =>
    Effect.gen(function* () {
      yield* Console.log("error with file analysis: ", e);
      return [];
    }),
  ),
);

function lotteryWinProbability(lottery: RaffleData["ProjectItems"][number]) {
  const aptsToHandicapped = Math.min(
    lottery.TotalHandicappedSubscribers,
    lottery.HousingUnitsForHandicapped.pipe(Option.getOrElse(() => 0)),
  );
  const aptsToLocal = Math.min(
    lottery.TotalLocalSubscribers,
    lottery.LocalHousing.pipe(Option.getOrElse(() => 0)),
  );
  const aptsToReservedDuty = Math.min(
    lottery.TotalReservedDutySubscribers,
    lottery.LotteryApparmentsNum / 5,
  );
  const unavailableApts = aptsToHandicapped + aptsToLocal + aptsToReservedDuty;
  if (lottery.LotteryApparmentsNum - unavailableApts <= 0) {
    return 0;
  }
  return Math.min(
    1,
    (lottery.LotteryApparmentsNum - unavailableApts) /
      (lottery.TotalSubscribers - unavailableApts),
  );
}

function median(items: number[]) {
  return Option.fromNullable(
    items.sort((a, b) => a - b)[Math.floor(items.length / 2)],
  );
}
