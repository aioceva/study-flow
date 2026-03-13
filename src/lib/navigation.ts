// Навигационна логика на урока

export function nextStep(
  user: string,
  moduleId: number,
  cardId: number,
  params: string
): string {
  if (cardId < 5) {
    return `/${user}/lesson/${moduleId}/${cardId + 1}?${params}`;
  }
  // Последна карта на модул
  if (moduleId === 1) return `/${user}/lesson/separator?from=1&to=2&${params}`;
  if (moduleId === 2) return `/${user}/lesson/quiz?number=1&${params}`;
  if (moduleId === 3) return `/${user}/lesson/separator?from=3&to=4&${params}`;
  if (moduleId === 4) return `/${user}/lesson/quiz?number=2&${params}`;
  return `/${user}`;
}

export function prevStep(
  user: string,
  moduleId: number,
  cardId: number,
  params: string
): string {
  if (cardId > 1) {
    return `/${user}/lesson/${moduleId}/${cardId - 1}?${params}`;
  }
  // Първа карта на модул — назад към separator или quiz
  if (moduleId === 1) return `/${user}`;
  if (moduleId === 2) return `/${user}/lesson/separator?from=1&to=2&${params}`;
  if (moduleId === 3) return `/${user}/lesson/quiz?number=1&${params}`;
  if (moduleId === 4) return `/${user}/lesson/separator?from=3&to=4&${params}`;
  return `/${user}`;
}
