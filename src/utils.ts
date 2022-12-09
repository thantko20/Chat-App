export const excludeFields = <T, Key extends keyof T>(
  doc: T,
  ...keys: Key[]
): Omit<T, Key> => {
  const newDoc = { ...doc };

  keys.forEach((key) => {
    delete newDoc[key];
  });

  return newDoc;
};
