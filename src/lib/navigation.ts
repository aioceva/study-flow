export function nextStep(
  user: string,
  moduleId: number,
  cardId: number,
  params: string
): string {
  const sp = new URLSearchParams(params);
  const isReview = sp.get("mode") === "review";

  if (cardId < 5) {
    return `/${user}/lesson/${moduleId}/${cardId + 1}?${params}`;
  }
  if (moduleId === 1) return `/${user}/lesson/separator?from=1&to=2&${params}`;
  if (moduleId === 2) return isReview
    ? `/${user}/lesson/3/1?${params}`
    : `/${user}/lesson/quiz?number=1&${params}`;
  if (moduleId === 3) return `/${user}/lesson/separator?from=3&to=4&${params}`;
  if (moduleId === 4) return isReview
    ? `/${user}/done?mode=review&${params}`
    : `/${user}/lesson/quiz?number=2&${params}`;
  return `/${user}`;
}

export function prevStep(
  user: string,
  moduleId: number,
  cardId: number,
  params: string
): string {
  const sp = new URLSearchParams(params);
  const isReview = sp.get("mode") === "review";

  if (cardId > 1) {
    return `/${user}/lesson/${moduleId}/${cardId - 1}?${params}`;
  }
  if (moduleId === 1) return `/${user}`;
  if (moduleId === 2) return `/${user}/lesson/separator?from=1&to=2&${params}`;
  if (moduleId === 3) return isReview
    ? `/${user}/lesson/2/5?${params}`
    : `/${user}/lesson/quiz?number=1&${params}`;
  if (moduleId === 4) return `/${user}/lesson/separator?from=3&to=4&${params}`;
  return `/${user}`;
}

export function nextButtonLabel(moduleId: number, cardId: number, isReview: boolean): string {
  if (cardId < 5) return "Напред →";
  if (moduleId === 1 || moduleId === 3) return "Напред →";
  if (moduleId === 2 || moduleId === 4) return isReview ? "Напред →" : "Провери дали запомни →";
  return "Напред →";
}
