import { useContext } from "react";
import { TabContext } from "../../context/TabContext";
import WelcomeComponent from "../common/Welcome";
import Header from "../Header";
import LoginBox from "../LoginBox/LoginBox";
import { Storage } from "../../types/data.type";

const ChatBoxWrapper = () => {
  const context = useContext(TabContext);
  if (!context) return null;

  const { setTab } = context;

  const token = localStorage.getItem(Storage.AUTH);

  if (token) setTab("main");
  return (
    <>
      <div className="flex flex-col flex-grow overflow-hidden">
        <Header />
        <WelcomeComponent tab="Login" />
        <LoginBox />
      </div>
    </>
  );
};

export default ChatBoxWrapper;
