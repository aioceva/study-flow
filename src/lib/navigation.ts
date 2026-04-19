export function nextStep(
  user: string,
  moduleId: number,
  cardId: number,
  params: string
): string {
  const sp = new URLSearchParams(params);
  const isTest = sp.get("mode") === "test";
  const home = isTest ? `/${user}?mode=test` : `/${user}`;

  if (cardId < 5) {
    return `/${user}/lesson/${moduleId}/${cardId + 1}?${params}`;
  }
  if (moduleId === 1) return `/${user}/lesson/separator?from=1&to=2&${params}`;
  if (moduleId === 2) return `/${user}/lesson/3/1?${params}`;
  if (moduleId === 3) return `/${user}/lesson/separator?from=3&to=4&${params}`;
  if (moduleId === 4) return `/${user}/done?${params}`;
  return home;
}

export function prevStep(
  user: string,
  moduleId: number,
  cardId: number,
  params: string
): string {
  const sp = new URLSearchParams(params);
  const isTest = sp.get("mode") === "test";
  const home = isTest ? `/${user}?mode=test` : `/${user}`;

  if (cardId > 1) {
    return `/${user}/lesson/${moduleId}/${cardId - 1}?${params}`;
  }
  if (moduleId === 1) return home;
  if (moduleId === 2) return `/${user}/lesson/separator?from=1&to=2&${params}`;
  if (moduleId === 3) return `/${user}/lesson/2/5?${params}`;
  if (moduleId === 4) return `/${user}/lesson/separator?from=3&to=4&${params}`;
  return home;
}
