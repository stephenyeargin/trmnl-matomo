function pick(obj, keys) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
  }
  return out;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

function transformVisitsSeries(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  if (value.result === 'error') {
    return pick(value, ['result', 'message']);
  }

  // Summary object shape.
  if (Object.prototype.hasOwnProperty.call(value, 'nb_actions')) {
    return pick(value, ['nb_actions', 'nb_uniq_visitors', 'nb_visits', 'sum_visit_length']);
  }

  // Date-keyed series shape.
  const out = {};
  for (const [date, point] of Object.entries(value)) {
    out[date] = pick(point, ['nb_actions', 'nb_uniq_visitors', 'nb_visits', 'sum_visit_length']);
  }
  return out;
}

function transform(input) {
  const data = Array.isArray(input)
    ? input
    : Array.isArray(input && input.data)
      ? input.data
      : [];

  const visitsSeries = transformVisitsSeries(data[0]);
  const siteInput = Array.isArray(data[1]) ? data[1][0] : data[1];
  const site = pick(siteInput, ['name']);

  const landingPages = normalizeList(data[2]).map((row) =>
    pick(row, ['label', 'nb_hits', 'nb_visits', 'bounce_rate'])
  );
  const referrers = normalizeList(data[3]).map((row) =>
    pick(row, ['label', 'nb_visits'])
  );
  const countries = normalizeList(data[4]).map((row) =>
    pick(row, ['label', 'nb_visits'])
  );

  return {
    IDX_0: visitsSeries,
    IDX_1: site,
    IDX_2: landingPages,
    IDX_3: referrers,
    IDX_4: countries,
  };
}
