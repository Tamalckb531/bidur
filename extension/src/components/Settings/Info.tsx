import { Smile } from "lucide-react";
import { ApiEndPoint, Storage, type User } from "../../types/data.type";
import { useContext, useState } from "react";
import { TabContext } from "../../context/TabContext";

const Info = () => {
  const payload = localStorage.getItem(Storage.USERINFO) || "";
  const token = localStorage.getItem(Storage.AUTH) || "";
  const user: User = JSON.parse(payload);

  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const apiBaseUrl: string =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";
  const context = useContext(TabContext);
  if (!context) return null;

  const { setTab } = context;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError("Api key cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${apiBaseUrl}/${ApiEndPoint.KEY_CHANGE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiKey),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Failed to update API key.");
      } else {
        setSuccessMsg("API key updated successfully!");
        setApiKey("");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError(null);
        setSuccessMsg(null);
      }, 3000);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem(Storage.AUTH);
    localStorage.removeItem(Storage.USERINFO);
    setTab("login");
  };

  return (
    <div className=" flex flex-col justify-center items-center gap-1 p-2 mt-2 text-[var(--dark-color)]">
      <p className=" flex items-center gap-2 justify-center  text-4xl font-bold text-center">
        Hi {user.name} <Smile />
      </p>
      <p>We are now at settings and info tabs</p>
      <form
        onSubmit={handleSubmit}
        className=" mt-5 mx-auto w-full text-center"
      >
        <div className="">
          <div className=" flex w-full">
            <input
              type="text"
              name="apiKey"
              id="apiKey"
              value={apiKey}
              onChange={handleChange}
              required
              className="block p-1.5 w-full text-sm text-gray-900 bg-[var(--bg-color)] rounded-lg border border-[var(--dark-color)] outline-none"
              placeholder="Change your api key"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className={`ml-2 inline-flex justify-center w-[70px] p-1.5 rounded-sm text-[14px] cursor-pointer ${
                loading
                  ? "bg-gray-500 cursor-not-allowed text-white"
                  : "bg-[var(--dark-color)] hover:bg-[#716863] text-[var(--bg-color)]"
              }`}
            >
              {loading ? "Loading..." : "Change"}
            </button>
          </div>
          {error && <p className="mt-2 text-red-500">{error}</p>}
          {successMsg && <p className="mt-2 text-green-600">{successMsg}</p>}
        </div>
      </form>
      <div className="mt-2 w-full flex ">
        <button
          type="button"
          className={`inline-flex justify-center w-[70px] p-1.5 rounded-sm text-[14px] cursor-pointer bg-[var(--dark-color)] hover:bg-[#716863] text-[var(--bg-color)]`}
          onClick={handleLogOut}
        >
          Logout
        </button>
        <button
          type="button"
          className={` ml-2 inline-flex justify-center w-[140px] p-1.5 rounded-sm text-[14px] cursor-pointer bg-[var(--dark-color)] hover:bg-[#716863] text-[var(--bg-color)]`}
          onClick={() => setTab("main")}
        >
          Goto Chat
        </button>
      </div>
    </div>
  );
};

export default Info;
