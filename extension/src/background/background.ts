import { getGitHubPageType } from "../helpers/func";
import { ChromeTypes } from "../types/data.type";
import {
  scrapeGTProfile,
  scrapeGTRepo,
  sendRepoFolderData,
} from "./background.core";

console.log("Background is running");

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  if (message.type === ChromeTypes.INIT) {
    const { url, tabId } = message;

    const pageType = getGitHubPageType(url);
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
  } else if (message.type === ChromeTypes.GT_PROF_DATA) {
    const enriched = await scrapeGTProfile(message.payload);

    console.log(
      "Background -> Got the entire Profile data from Api and DOM : ",
      enriched
    );

    sendResponse({ enriched });

    return true;
  } else if (message.type === ChromeTypes.GT_REPO_DATA) {
    const repoFullData = await scrapeGTRepo(message.payload);

    console.log(
      "Background -> Got the entire Repo data from Api and DOM : ",
      repoFullData
    );

    sendResponse({ repoFullData });

    return true;
  } else if (message.type === ChromeTypes.GT_REPO_FOLDER_DATA) {
    const res = await sendRepoFolderData(message.payload);
    res
      ? sendResponse({ msg: "Data send successfully" })
      : sendResponse({ msg: "Data couldn't sent" });
    return res;
  }
});
