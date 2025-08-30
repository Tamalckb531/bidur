import { HTTPException } from "hono/http-exception";
import { decryptApiKey } from "../libs/encryptions";
import { getPrisma } from "../libs/prismaFunc";
import { formatDatetime } from "../libs/utils";
import {
  Enriched,
  RepoData,
  RepoFileData,
  RepoFolderData,
  UrlType,
} from "../types/data.type";
import { storeEmbeddings } from "../vector/embed";

const stringifyProfile = (enriched: Enriched): string[] => {
  const { userData, allRepos } = enriched;
  let profileText: string = "";
  let repoTexts: string[] = [];

  try {
    profileText = `Name: ${userData.name}, Username: ${
      userData.username
    }, Bio: ${userData.bio}, Location: ${userData.location}, Website: ${
      userData.website
    }, total repository: ${
      userData.repoCount
    }, pinned repository : ${userData.pinnedRepos?.join(", ")}`;

    repoTexts = allRepos.map((repo) => {
      return `Repository: ${repo.name}, Full name: ${
        repo.full_name
      }, Description: ${repo.description},  Size: ${
        repo.size
      } Kilobyte, Language: ${repo.language?.join(", ")}, Stars: ${
        repo.stargazers_count
      }, Watchers : ${repo.watchers_count}, Total Open issues: ${
        repo.open_issues_count
      }, License : ${repo.license?.name}, Total Fork : ${
        repo.forks
      }, topics : ${repo.topics?.join(", ")}, Last update : ${formatDatetime(
        repo.updated_at || " "
      )}, Link to github : ${repo.html_url}, Tags : ${repo.tag?.join(", ")}`;
    });
  } catch (err: any) {
    console.log("Error occurred in stringifyProfile: ", err);
  }

  return [profileText, ...repoTexts];
};

const stringifyRepo = (repo: RepoData): string[] => {
  const { repoBasicData, repoApiData } = repo;

  let basicInfo: string = "";
  let readmeText: string = "";
  let fileTreeText: string = "";
  let openIssuesText: string = "";
  let openPrsText: string = "";
  let releasesSummaryText: string = "";
  let contributorsSummaryText: string = "";
  try {
    //! Basic info summery
    basicInfo = `Repository: ${repoBasicData.owner}/${repoBasicData.repoName}.
Description: ${repoBasicData.repoDescription || "No description provided."}
Stars: ${repoBasicData.starsCount}, Forks: ${
      repoBasicData.forkCount
    }, Watchers: ${repoBasicData.watchersCount}.
License: ${repoBasicData.license || "No license specified"}.
Default branch: ${repoBasicData.defaultBranch},
Open issues: ${repoBasicData.openIssuesCount}, Open pull requests: ${
      repoBasicData.openPullReqCount
    }.
Topics: ${repoBasicData.topics.join(", ") || "None"}.
Last updated: ${formatDatetime(repoBasicData.lastUpdated || "Unknown")}.`;

    //! Readme text separately
    readmeText = repoBasicData.readmeText
      ? repoBasicData.readmeText.replace(/\s*\n\s*/g, " ").trim()
      : "No Readme available";

    //! File Tree summery
    const filterTreeItems = repoBasicData.fileTree.map(
      (item) => `${item.type === "dir" ? "Directory" : "File"}:${item.name}`
    );

    fileTreeText = `Folder Structure : ${
      filterTreeItems.length > 0
        ? filterTreeItems.join(", ")
        : "No files or folders listed"
    }`;

    //! Open issues summary
    const openIssuesSummary = repoApiData.openIssues
      .map(
        (issue) =>
          `#${issue.number} [${issue.state}] ${issue.title} (Labels: ${
            issue.labels.join(", ") || "None"
          })`
      )
      .join(" | ");

    openIssuesText = `Open Issues: ${openIssuesSummary || "No Open Issues"}.`;

    //! Open prs summary
    const openPrsSummary = repoApiData.openPullRequests
      .map(
        (pr) =>
          `#${pr.number} [${pr.state}] ${pr.title} (Labels: ${
            pr.labels.join(", ") || "None"
          })`
      )
      .join(" | ");

    openPrsText = `Open Pull Requests: ${
      openPrsSummary || "No Open Pull Requests"
    }.`;

    //! Releases summary
    const ReleasesSummary = repoApiData.releases
      .map(
        (release) =>
          `${release.tag_name} - ${release.name} (Published: ${formatDatetime(
            release.published_at || "Unknown"
          )}) [url: ${release.url}]`
      )
      .join(" | ");

    releasesSummaryText = `Recent Releases: ${
      ReleasesSummary || "No releases available"
    }.`;

    //! Contributors summary
    const ContributorsSummary = repoApiData.contributors
      .map(
        (contributor) =>
          `${contributor.login} - ${contributor.contributions} contributions`
      )
      .join(" | ");

    contributorsSummaryText = `Top Contributors: ${
      ContributorsSummary || "No contributors."
    }.`;
  } catch (err: any) {
    console.log("Error occurred in stringifyRepo: ", err);
  }
  return [
    basicInfo,
    readmeText,
    fileTreeText,
    openIssuesText,
    openPrsText,
    releasesSummaryText,
    contributorsSummaryText,
  ];
};

const stringifyRepoFile = (file: RepoFileData): string[] => {
  let fileText: string = "";
  try {
    fileText = `File Name : ${file.fileName}, located at : ${
      file.path
    }, content or code in that file : ${file.content || "No content"}`;
  } catch (err: any) {
    console.log("Error occurred in stringifyRepoFile: ", err);
  }
  return [fileText];
};

const stringifyRepoFolder = (folder: RepoFolderData): string[] => {
  let folderInfoText: string = "";
  let folderReadmeText: string = "";
  try {
    const filterTreeItems = folder.fileTree.map(
      (item) => `${item.type === "dir" ? "Directory" : "File"}:${item.name}`
    );

    const fileTreeText = `Folder Structure : ${
      filterTreeItems.length > 0
        ? filterTreeItems.join(", ")
        : "No files or folders listed"
    }`;

    folderInfoText = `Folder name : ${folder.folderName}, Folder path: ${folder.path}, Also ${fileTreeText}`;

    folderReadmeText = `Folder ${folder.folderName} Readme text : ${
      folder.readmeText
        ? folder.readmeText.replace(/\s*\n\s*/g, " ").trim()
        : "No Readme available"
    }`;
  } catch (err: any) {
    console.log("Error occurred in stringifyRepoFolder: ", err);
  }
  return [folderInfoText, folderReadmeText];
};

export const handleEnrichedData = async (
  data: Enriched | RepoData | RepoFileData | RepoFolderData,
  type: UrlType,
  userId: string | null,
  key: string,
  encryptKey: string,
  qdrantKey: string,
  qdrantUrl: string,
  db_url: string
) => {
  try {
    const prisma = getPrisma(db_url);

    let docs: string[];
    switch (type) {
      case "PROFILE":
        docs = stringifyProfile(data as Enriched);
        break;
      case "REPO":
        docs = stringifyRepo(data as RepoData);
        break;
      case "REPO_IN_File":
        docs = stringifyRepoFile(data as RepoFileData);
        break;
      case "REPO_IN_Folder":
        docs = stringifyRepoFolder(data as RepoFolderData);
        break;
      default:
        throw new Error("Unsupported Url");
    }

    //? getting user api key
    let apiKey: string = key;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          apiKey: true,
        },
      });
      if (user?.apiKey) {
        apiKey = decryptApiKey(user.apiKey, encryptKey);
      }
    }

    await storeEmbeddings(docs, apiKey, data.info, qdrantKey, qdrantUrl);
  } catch (e: any) {
    throw new HTTPException(500, {
      message: e.message || "Error occurred while getting the apiKey of user",
    });
  }
};
