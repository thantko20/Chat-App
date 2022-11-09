export const excludeFields = <T, Key extends keyof T>(
  doc: T,
  ...keys: Key[]
): Omit<T, Key> => {
  for (let key of keys) {
    delete doc[key];
  }
  return doc;
};
