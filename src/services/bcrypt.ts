import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string);

export const genHashAndSalt = async (
  plainTextPassword: string,
): Promise<{ password: string; salt: string }> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const password = await bcrypt.hash(plainTextPassword, salt);

  return {
    password,
    salt,
  };
};
