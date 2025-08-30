import Header from "../Header";
import Info from "../Settings/Info";

const SettingsWrapper = () => {
  return (
    <>
      <div className="flex flex-col flex-grow overflow-hidden">
        <Header />
        <Info />
      </div>
    </>
  );
};

export default SettingsWrapper;
