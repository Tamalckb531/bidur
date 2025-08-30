import { Smile } from "lucide-react";
import { Storage, type User } from "../../types/data.type";

const Info = () => {
  const payload = localStorage.getItem(Storage.USERINFO) || "";
  const user: User = JSON.parse(payload);
  return (
    <div className=" flex flex-col justify-center items-center gap-1 p-2 mt-2 text-[var(--dark-color)]">
      <p className=" flex items-center gap-2 justify-center  text-4xl font-bold text-center">
        Hi {user.name} <Smile />
      </p>
      <p>We are now at settings and info tabs</p>
      <form action="" className=" mt-5 mx-auto w-full text-center">
        <div className="">
          <div className=" flex w-full">
            <input
              type="text"
              name="apiKey"
              id="apiKey"
              value={""}
              // onChange={handleChange}
              required
              className="block p-1.5 w-full text-sm text-gray-900 bg-[var(--bg-color)] rounded-lg border border-[var(--dark-color)] outline-none"
              placeholder="Change your api key"
            />
            <button
              type="submit"
              className=" ml-2 inline-flex justify-center w-[70px] p-1.5 text-[var(--bg-color)] rounded-sm text-[14px] cursor-pointer bg-[var(--dark-color)] hover:bg-[#716863]"
            >
              Change
            </button>
          </div>
          {/* {errors.apiKey && <p className="p-1 text-red-400">{errors.apiKey}</p>} */}
        </div>
      </form>
    </div>
  );
};

export default Info;
