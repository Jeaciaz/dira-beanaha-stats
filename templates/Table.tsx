import { Option } from "effect";
import type { FileAnalysis } from "../lib/analyze";
import { formatDate } from "date-fns";

type TableProps = {
  tableItems: FileAnalysis;
  sortCol?: string;
  sortDir?: string;
};

export const Table = ({
  tableItems,
  sortCol = "lotteryDate",
  sortDir = "desc",
}: TableProps) => {
  return (
    <table class="table" id="Table" hx-swap-oob="true">
      <script src="/static/table-sort.js" />
      <thead>
        <tr>
          <th>
            City
            <TableSortArrow
              sortCol={sortCol}
              sortDir={sortDir}
              colName="cityName"
            />
          </th>
          <th>
            Lottery Date
            <TableSortArrow
              sortCol={sortCol}
              sortDir={sortDir}
              colName="lotteryDate"
            />
          </th>
          <th>
            Lotteries conducted at date
            <TableSortArrow
              sortCol={sortCol}
              sortDir={sortDir}
              colName="lotteriesConducted"
            />
          </th>
          <th>
            Median price per m^2
            <TableSortArrow
              sortCol={sortCol}
              sortDir={sortDir}
              colName="medianPrice"
            />
          </th>
          <th>
            Median probability to win
            <TableSortArrow
              sortCol={sortCol}
              sortDir={sortDir}
              colName="medianProbability"
            />
          </th>
          <th>
            Probability to win in at least one
            <TableSortArrow
              sortCol={sortCol}
              sortDir={sortDir}
              colName="probabilityToWinInAtLeastOne"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {tableItems.map((item) => (
          <tr>
            <td safe>{item.cityName}</td>
            <td safe>{formatDate(item.lotteryDate, "dd-MM-yyyy")}</td>
            <td>{item.lotteriesNum}</td>
            <td safe>
              {item.medianPrice.pipe(
                Option.match({
                  onNone: () => "-",
                  onSome: (v) => v.toFixed(2),
                }),
              )}
            </td>
            <td safe>
              {item.medianProbability.pipe(
                Option.match({
                  onNone: () => "-",
                  onSome: (v) => `${(100 * v).toFixed(2)}%`,
                }),
              )}
            </td>
            <td safe>{item.probabilityToWinInAtLeastOne}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

type TableSortArrowProps = {
  sortDir: string;
  sortCol: string;
  colName: string;
};

function TableSortArrow({ sortDir, sortCol, colName }: TableSortArrowProps) {
  return (
    <span
      class={
        "btn btn-ghost btn-circle btn-xs" +
        " " +
        (sortCol === colName ? "opacity-100" : "opacity-25")
      }
      data-table-sort={colName}
      data-table-sort-dir={sortCol === colName ? reverseSort(sortDir) : sortDir}
    >
      {sortDir === "asc" ? "↑" : "↓"}
    </span>
  );
}

function reverseSort(sortDir: string) {
  return sortDir === "desc" ? "asc" : "desc";
}
