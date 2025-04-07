type FiltersProps = {
  years: number[];
};

export const Filters = ({ years }: FiltersProps) => {
  return (
    <div class="flex p-8 gap-4">
      <div class="flex gap-2">
        <form id="filtersYears" class="join">
          {years.map((y) => (
            <input
              class="join-item btn"
              type="checkbox"
              name="years"
              value={`${y}`}
              aria-label={y}
            />
          ))}
        </form>
        <label class="input">
          <span class="label">City name</span>
          <input id="filterCityName" type="text" placeholder="אופקים" />
        </label>
        <script src="/static/filters.js" />
      </div>
    </div>
  );
};
