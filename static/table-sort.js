window.sortBtns = document.querySelectorAll("[data-table-sort]");

[...window.sortBtns].forEach((btn) => {
  btn.addEventListener("click", () => {
    const sort = btn.dataset.tableSort;
    setQueryParamsAndGetOob("sort", sort);
    setQueryParamsAndGetOob(
      "sortDir",
      btn.dataset.tableSortDir,
      "/templates/table",
    );
  });
});
