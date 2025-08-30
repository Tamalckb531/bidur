import { encryptApiKey } from "./../libs/encryptions";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getPrisma } from "../libs/prismaFunc";
import { User } from "../generated/prisma";

export const changeApiKey = async (c: Context) => {
  const userId: string | null = c.get("userId");
  const apiKey = await c.req.json<string>();

  try {
    if (!userId)
      throw new HTTPException(400, {
        message: "You are not authorized",
      });

    const prisma = getPrisma(c.env.DATABASE_URL);

    const validUser: User | null = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!validUser)
      throw new HTTPException(400, {
        message: "User not exist",
      });

    const encryptKey: string = encryptApiKey(apiKey, c.env.ENCRYPTION_KEY);

    await prisma.user.update({
      where: { id: userId },
      data: { apiKey: encryptKey },
    });

    return c.json({ status: 200, msg: "Successfully updated api key" });
  } catch (e: any) {
    throw new HTTPException(500, {
      message: e.message || "An error occurred while logging in",
    });
  }
};
