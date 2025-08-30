import { ChromeTypes } from "../types/data.type";
import { getProfileData } from "./content.core";

console.log("Content is running");

//? Guard for content.ts
if (!window.location.hostname.includes("github.com")) {
  throw new Error("Not GitHub");
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case ChromeTypes.PROFILE:
      const data = getProfileData();
      console.log("Content -> Scrape Profile data from DOM: ", data);

      //? Sending profile data to background.ts
      chrome.runtime.sendMessage({
        type: ChromeTypes.GT_PROF_DATA,
        payload: data,
      });
      break;
    default:
      console.warn("Unknown message type: ", message.type);
  }
});
