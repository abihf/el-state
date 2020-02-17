export function strictComparator<T>(a: T, b: T) {
  return a === b;
}

export function arrayComparator<Arr extends any[]>(a: Arr, b: Arr) {
  if (a.length !== b.length) {
    return false;
  }
  for (const i in a) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
