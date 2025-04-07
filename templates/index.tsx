import type { FileAnalysis } from "../lib/analyze";
import { Filters } from "./Filters";

type IndexPageProps = {
  tableData: FileAnalysis;
  searchParams: string;
};

export const IndexPage = ({ tableData, searchParams }: IndexPageProps) => {
  const years = [
    ...new Set(tableData.map((v) => v.lotteryDate.getUTCFullYear())),
  ].sort((a, b) => a - b);

  return (
    <>
      {/*<!doctype html>*/}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="/static/styles.css" rel="stylesheet" />
          <title>Dira BeAnaha statistics</title>
        </head>
        <body>
          <Filters years={years} />
          <div
            id="Table"
            hx-get={`/templates/table?${searchParams}`}
            hx-target="#Table"
            hx-swap="outerHTML"
            hx-trigger="load"
          />
          <div id="oob" />
          <script src="https://unpkg.com/htmx.org@2.0.4" />
          <script src="/static/queryParams.js" />
        </body>
      </html>
    </>
  );
};
