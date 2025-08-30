import WelcomeComponent from "../common/Welcome";
import Header from "../Header";
import LoginBox from "../LoginBox/LoginBox";

const ChatBoxWrapper = () => {
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
