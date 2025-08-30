import { getGitHubPageType } from "../helpers/func";
import { ChromeTypes } from "../types/data.type";

console.log("Background is running");

chrome.runtime.onMessage.addListener(
  async (message, _sender, _sendResponse) => {
    if (message.type === ChromeTypes.INIT) {
      const { url, tabId } = message;

      const pageType = getGitHubPageType(url);
      console.log(
        "Getting page type from the init background end : ",
        pageType
      );

      // let storable: boolean = false;

      // if (pageType !== "NONE") {
      //   storable = await isDataStorable(url);
      //   console.log(
      //     "Background -> is the data storable in the vector database ? Answer: ",
      //     storable
      //   );
      // }

      // if (!storable) return;

      //? page type wise event register for the content.
      switch (pageType) {
        case "PROFILE":
          chrome.tabs.sendMessage(tabId, { type: ChromeTypes.PROFILE });
          break;
        case "REPO":
          chrome.tabs.sendMessage(tabId, { type: ChromeTypes.REPO });
          break;
        case "REPO_IN_Folder":
          chrome.tabs.sendMessage(tabId, {
            type: ChromeTypes.REPO_FOLDER,
            url: url,
          });
          break;
        case "REPO_IN_File":
          chrome.tabs.sendMessage(tabId, {
            type: ChromeTypes.REPO_FILE,
            url: url,
          });
          break;
        default:
          break;
      }
    }
  }
);
