import { QueryFunction } from ".";

export const sort: QueryFunction = (list, value, config) => {
  const result = [...list];
  const order = config.request.query["order"] || "asc";
  result.sort((a, b) => {
    if (order == "asc") {
      return a[value] > b[value] ? 1 : a[value] == b[value] ? 0 : -1;
    } else {
      return a[value] < b[value] ? 1 : a[value] == b[value] ? 0 : -1;
    }
  });
  return result;
};

export const offset: QueryFunction = (list, value, config) => {
  const size = +(config.request.query["size"] || "10");
  return list.slice(+value, +value + size);
};
