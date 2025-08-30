import { Context } from "hono";
import {
  LoginBodyTypes,
  LoginSchema,
  SignUpBodyTypes,
  SignUpSchema,
} from "../types/schema/zod.index";
import { HTTPException } from "hono/http-exception";
import bcrypt from "bcryptjs";
import { encryptApiKey } from "../libs/encryptions";
import jwt from "jsonwebtoken";
import { User } from "../generated/prisma";
import { getPrisma } from "../libs/prismaFunc";

export const signup = async (c: Context) => {
  const { email, password, name, apiKey } = await c.req.json<SignUpBodyTypes>();

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);

    SignUpSchema.parse({ name, email, apiKey, password });

    const isUserExist: boolean =
      (await prisma.user.count({
        where: { email },
      })) > 0;

    if (isUserExist) {
      throw new HTTPException(400, { message: "This email already exist" });
    }

    const hashedPassword: string = bcrypt.hashSync(password, 10);

    const encryptedKey: string = encryptApiKey(apiKey, c.env.ENCRYPTION_KEY);

    const newUser: User = await prisma.user.create({
      data: {
        email,
        name,
        apiKey: encryptedKey,
        password: hashedPassword,
      },
    });

    if (!c.env.JWT_SECRET_KEY) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in the environment variables"
      );
    }

    const token: string = jwt.sign(
      {
        id: newUser.id,
      },
      c.env.JWT_SECRET_KEY
    );

    const { password: pass, apiKey: key, ...user } = newUser;

    return c.json({
      msg: "Signed up successfully",
      user: user,
      token,
    });
  } catch (e: any) {
    throw new HTTPException(500, {
      message: e.message || "An error occurred while logging in",
    });
  }
};

export const login = async (c: Context) => {
  const { email, password } = await c.req.json<LoginBodyTypes>();

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    LoginSchema.parse({ email, password });

    const validUser: User | null = await prisma.user.findFirst({
      where: { email },
    });

    if (!validUser)
      throw new HTTPException(400, {
        message: "Email not registered",
      });

    const validPassword: boolean = bcrypt.compareSync(
      password,
      validUser.password
    );

    if (!validPassword)
      throw new HTTPException(400, {
        message: "Invalid Password",
      });

    if (!c.env.JWT_SECRET_KEY) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in the environment variables"
      );
    }

    const token: string = jwt.sign(
      {
        id: validUser.id,
      },
      c.env.JWT_SECRET_KEY
    );

    const { password: pass, apiKey: key, ...user } = validUser;

    return c.json({
      msg: "Logged in successfully",
      user: user,
      token,
    });
  } catch (e: any) {
    throw new HTTPException(500, {
      message: e.message || "An error occurred while logging in",
    });
  }
};
