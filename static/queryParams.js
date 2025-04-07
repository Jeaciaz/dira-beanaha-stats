function setQueryParamsAndGetOob(key, value, uri) {
  const params = new URLSearchParams(location.search);
  params.delete(key);
  if (Array.isArray(value)) {
    value.forEach((v) => params.append(key, v));
  } else {
    params.append(key, value);
  }
  const newUrl =
    window.location.origin + window.location.pathname + "?" + params.toString();
  window.history.pushState({ path: newUrl }, "", newUrl);
  if (uri) {
    htmx.ajax("GET", uri + "?" + params.toString(), "#oob");
  }
}
