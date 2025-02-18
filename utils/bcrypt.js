import bcrypt from "bcryptjs";

// Function to hash passwords
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Function to compare passwords
export const comparePassword = async (
  enteredPassword,
  storedHashedPassword
) => {
  return await bcrypt.compare(enteredPassword, storedHashedPassword);
};
