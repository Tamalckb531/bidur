import { useContext } from "react";
import WelcomeComponent from "../common/Welcome";
import Header from "../Header";
import SignupBox from "../SignupBox/SignupBox";
import { TabContext } from "../../context/TabContext";
import { Storage } from "../../types/data.type";

const SignupWrapper = () => {
  const context = useContext(TabContext);
  if (!context) return null;

  const { setTab } = context;

  const token = localStorage.getItem(Storage.AUTH);

  if (token) setTab("main");
  return (
    <>
      <div className="flex flex-col flex-grow overflow-hidden">
        <Header />
        <WelcomeComponent tab="Signup" />
        <SignupBox />
      </div>
    </>
  );
};

export default SignupWrapper;
