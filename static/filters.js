const years = new URLSearchParams(location.search).getAll("year");

filtersYears.querySelectorAll("input").forEach((i) => {
  if (years.includes(i.value)) {
    i.checked = true;
  }
  i.addEventListener("input", (e) => {
    if (e.currentTarget.checked) {
      years.push(e.currentTarget.value);
    } else {
      years.splice(years.indexOf(e.currentTarget.value), 1);
    }

    setQueryParamsAndGetOob("year", years, "/templates/table");
  });
});

filterCityName.addEventListener("input", (e) => {
  setQueryParamsAndGetOob(
    "cityName",
    e.currentTarget.value,
    "/templates/table",
  );
});
