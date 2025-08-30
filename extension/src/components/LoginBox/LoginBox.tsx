import { useContext, useState } from "react";
import {
  LoginSchema,
  type LoginBodyTypes,
} from "../../types/schema/data.schema";
import { ZodError } from "zod";
import { Eye, EyeClosed } from "lucide-react";
import { TabContext } from "../../context/TabContext";
import {
  ApiEndPoint,
  Storage,
  type ServerAuthData,
} from "../../types/data.type";

const initialFormState: LoginBodyTypes = {
  email: "",
  password: "",
};

type FormErrors = Partial<Record<keyof LoginBodyTypes, string>>;

const LoginBox: React.FC = () => {
  const [formData, setFormData] = useState<LoginBodyTypes>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hide, setHide] = useState<boolean>(true);
  const [errMsg, setErrMsg] = useState<string>("");

  const context = useContext(TabContext);
  if (!context) return null;

  const { setTab } = context;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    //? Clear error on change for that field
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      LoginSchema.parse(formData);
      setErrors({});

      const apiBaseUrl: string =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

      const response = await fetch(`${apiBaseUrl}/${ApiEndPoint.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data: ServerAuthData = await response.json();

      localStorage.setItem(Storage.AUTH, data.token);
      localStorage.setItem(Storage.USERINFO, JSON.stringify(data.user));

      setTab("main");
    } catch (error: any) {
      if (error instanceof ZodError) {
        const fieldErrors: FormErrors = {};
        error.issues.forEach((err) => {
          if (err.path && err.path[0]) {
            const fieldName = err.path[0] as keyof LoginBodyTypes;
            fieldErrors[fieldName] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error.message === "Failed to fetch") {
        setErrMsg(
          "Server not responding. Check out the connection or try again"
        );
      } else {
        setErrMsg(error.message);
      }
    } finally {
      setTimeout(() => {
        setErrMsg("");
      }, 5000);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className=" flex flex-col items-center justify-center my-5 gap-2"
    >
      <div className=" w-[80%]">
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="block p-1.5 w-full text-sm text-gray-900 bg-[var(--bg-color)] rounded-lg border border-[var(--dark-color)] outline-none"
          placeholder="Enter Your Email"
        />
        {errors.email && <p className="p-1 text-red-400">{errors.email}</p>}
      </div>
      <div className=" w-[80%]">
        <div className=" flex w-full">
          <input
            type={hide ? "password" : "text"}
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="block p-1.5 w-full text-sm text-gray-900 bg-[var(--bg-color)] rounded-lg border border-[var(--dark-color)] outline-none"
            placeholder="Enter Your Password"
          />
          <button
            type="button"
            className=" ml-1 cursor-pointer"
            onClick={() => setHide((prev) => !prev)}
          >
            {hide ? <Eye size={20} /> : <EyeClosed size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="p-1 text-red-400">{errors.password}</p>
        )}
      </div>

      <div className=" w-[80%] mt-2">
        <button
          type="submit"
          className="inline-flex justify-center w-[70px] p-1.5 text-[var(--bg-color)] rounded-sm text-[14px] cursor-pointer bg-[var(--dark-color)] hover:bg-[#716863]"
        >
          Submit
        </button>
      </div>
      <p className=" w-[80%] mt-5 text-center text-[14px]">
        Do not have an account ?{" "}
        <span
          className=" font-bold text-blue-400 cursor-pointer"
          onClick={() => setTab("signup")}
        >
          Signup
        </span>
      </p>
      {errMsg.length > 0 && <p className="p-1 text-red-400">{errMsg}</p>}
    </form>
  );
};

export default LoginBox;
