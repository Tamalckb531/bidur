import {
  getProfileData,
  getRepoDataFromDOM,
  getRepoFolderDataFromDOM,
} from "./content.core";

console.log("Content is running");

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

//? Guard for content.ts
if (!window.location.hostname.includes("github.com")) {
  throw new Error("Not GitHub");
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case ChromeTypes.PROFILE:
      const data = getProfileData();

      //? Sending profile data to background.ts
      chrome.runtime.sendMessage({
        type: ChromeTypes.GT_PROF_DATA,
        payload: data,
      });
      break;
    case ChromeTypes.REPO:
      const repoBasicData = getRepoDataFromDOM();

      chrome.runtime.sendMessage({
        type: ChromeTypes.GT_REPO_DATA,
        payload: repoBasicData,
      });
      break;
    case ChromeTypes.REPO_FOLDER:
      const repoFolderData = getRepoFolderDataFromDOM();

      chrome.runtime.sendMessage({
        type: ChromeTypes.GT_REPO_FOLDER_DATA,
        payload: repoFolderData,
      });
      break;
    default:
      console.warn("Unknown message type: ", message.type);
  }
});
