import jwt from "jsonwebtoken";
export function generateToken(userId: string): string {
  const token = jwt.sign(
    {
      _id: userId,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    },
  );

  return token;
}
