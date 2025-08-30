import type { UrlType } from "../types/data.type";
import {
  scrapeGTProfile,
  scrapeGTRepo,
  sendRepoFileData,
  sendRepoFolderData,
} from "./background.core";

console.log("Background is running");

const ChromeTypes = {
  INIT: "INIT_SCRAPE",
  PROFILE: "START_SCRAPE_PROFILE",
  REPO: "START_SCRAPE_REPO",
  REPO_FOLDER: "START_SCRAPE_REPO_Folder",
  REPO_FILE: "START_SCRAPE_REPO_File",
  GT_PROF_DATA: "GITHUB_PROFILE_DATA",
  GT_REPO_DATA: "GITHUB_REPO_DATA",
  GT_REPO_FILE_DATA: "GITHUB_REPO_FILE_DATA",
  GT_REPO_FOLDER_DATA: "GITHUB_REPO_FOLDER_DATA",
};

const reservedPages = [
  "dashboard",
  "notifications",
  "settings",
  "pulls",
  "issues",
  "marketplace",
  "explore",
  "apps",
  "topics",
  "collections",
  "events",
  "sponsors",
  "codespaces",
  "copilot",
  "discussion",
  "projects",
];

const getGitHubPageType = (url: string): UrlType => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return "NONE";

    const pathParts = parsed.pathname.split("/").filter(Boolean);

    if (pathParts.length == 0) return "NONE";
    if (reservedPages.includes(pathParts[0])) return "NONE";

    if (pathParts.length === 1) return "PROFILE";
    if (pathParts.length === 2) return "REPO";
    if (pathParts.length >= 3 && pathParts[2] === "tree")
      return "REPO_IN_Folder";
    if (pathParts.length >= 3 && pathParts[2] === "blob") return "REPO_IN_File";

    return "NONE";
  } catch {
    return "NONE";
  }
};

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

    sendResponse({ enriched });

    return true;
  } else if (message.type === ChromeTypes.GT_REPO_DATA) {
    const repoFullData = await scrapeGTRepo(message.payload);

    sendResponse({ repoFullData });

    return true;
  } else if (message.type === ChromeTypes.GT_REPO_FOLDER_DATA) {
    const res = await sendRepoFolderData(message.payload);
    res
      ? sendResponse({ msg: "Data send successfully" })
      : sendResponse({ msg: "Data couldn't sent" });
    return res;
  } else if (message.type === ChromeTypes.GT_REPO_FILE_DATA) {
    const res = await sendRepoFileData(message.payload);
    res
      ? sendResponse({ msg: "Data send successfully" })
      : sendResponse({ msg: "Data couldn't sent" });
    return res;
  }
});
