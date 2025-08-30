import { fetchJson } from "../helpers/func";
import type {
  Contributors,
  Enriched,
  IssuesPr,
  ProfileDataPayload,
  Releases,
  RepoApiData,
  RepoBasicData,
  RepoData,
  RepoFileData,
  RepoFolderData,
  RepoInfo,
  RepoTag,
} from "../types/data.type";

// import { ApiEndPoint } from "../types/data.type";

// const apiBaseUrl: string =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export const slimRepos = async (
  repo: any,
  username: string
): Promise<RepoInfo> => {
  const langRes = await fetch(
    `https://api.github.com/repos/${username}/${repo.name}/languages`
  );

  //? Build language array
  const langData = await langRes.json();
  const languagesArray = Object.keys(langData);

  //? Build tags array
  const tags: RepoTag[] = [];
  if (repo.open_issues_count > 0) tags.push("open_issues");
  if (repo.license > 0) tags.push("open_source");
  if (repo.forks > 0) tags.push("can_fork");
  const popularityScore =
    repo.stargazers_count + repo.forks + repo.open_issues_count;
  if (popularityScore > 1000) tags.push("popular");
  if (!repo.private) tags.push("public");

  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    size: repo.size,
    stargazers_count: repo.stargazers_count,
    watchers_count: repo.watchers_count,
    language: languagesArray,
    open_issues_count: repo.open_issues_count,
    license: repo.license ? { name: repo.license.name } : null,
    forks: repo.forks,
    open_issues: repo.open_issues,
    topics: repo.topics,
    updated_at: repo.updated_at,
    has_issues: repo.has_issues,
    html_url: repo.html_url,
    tag: tags,
  };
};

export const scrapeGTProfile = async (
  userData: ProfileDataPayload
): Promise<Enriched> => {
  const username = userData.username;

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`
  );
  const repos = await reposRes.json();

  const topRepos = repos.slice(0, 7);

  const enrichedRepos = await Promise.all(
    topRepos.map((repo: any) => slimRepos(repo, username))
  );

  const data = {
    info: `profile/${username}`,
    userData,
    allRepos: enrichedRepos,
  };

  //? Send to backend server
  //   try {
  //     await fetch(`${apiBaseUrl}/${ApiEndPoint.PROFILE}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     });
  //     console.log("Background.core -> Send Profile data to backend successfully");
  //   } catch (err) {
  //     console.error("Failed to send data to backend. Error: ", err);
  //   }

  return data;
};

export const scrapeGTRepo = async (
  repoBasicData: RepoBasicData
): Promise<RepoData> => {
  const { owner, repoName } = repoBasicData;

  //? Fetch open issues (Limit 30)
  let openIssues: IssuesPr[] = [];
  try {
    const issuesRes = await fetchJson(
      `https://api.github.com/repos/${owner}/${repoName}/issues?state=open&per_page=30`
    );

    openIssues = issuesRes
      .filter((issue: any) => !issue.pull_request)
      .map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        labels: issue.labels.map((label: any) => label.name),
      }));
  } catch (err) {
    console.warn("Failed to fetch open issues", err);
  }

  //? Fetch Pull requests (Limit 30)
  let openPullRequests: IssuesPr[] = [];
  try {
    const prRes = await fetchJson(
      `https://api.github.com/repos/${owner}/${repoName}/pulls?state=open&per_page=30`
    );

    openPullRequests = prRes.map((pr: any) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      labels: pr.labels.map((label: any) => label.name),
    }));
  } catch (err) {
    console.warn("Failed to fetch open pull requests", err);
  }

  //? Fetch latest 5 releases
  let releases: Releases[] = [];
  try {
    const releasesRes = await fetchJson(
      `https://api.github.com/repos/${owner}/${repoName}/releases?per_page=5`
    );

    if (Array.isArray(releasesRes)) {
      releases = releasesRes.map((release: any) => ({
        tag_name: release.tag_name,
        name: release.name,
        body: release.body,
        published_at: release.published_at,
        url: release.html_url,
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch latest releases", err);
  }

  //? Fetch top 10 contributors
  let contributors: Contributors[] = [];
  try {
    const contributorsRes = await fetchJson(
      `https://api.github.com/repos/${owner}/${repoName}/contributors?per_page=10`
    );

    if (Array.isArray(contributorsRes)) {
      contributors = contributorsRes.map((contri: any) => ({
        login: contri.lgoin,
        contributions: contri.contributions,
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch top 10 contributors", err);
  }

  //? Making finalize data
  const repoApiData: RepoApiData = {
    openIssues,
    openPullRequests,
    releases,
    contributors,
  };

  const data: RepoData = {
    info: `repo/${owner}/${repoName}`,
    repoBasicData: repoBasicData,
    repoApiData: repoApiData,
  };

  // //? Send data to backend :
  // try {
  //   await fetch(`${apiBaseUrl}/${ApiEndPoint.REPO}`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   console.log("Background.core -> Send Repo data to backend successfully");
  // } catch (err) {
  //   console.error("Failed to send repo enriched data to backend", err);
  // }

  return data;
};

export const sendRepoFolderData = async (
  data: RepoFolderData
): Promise<boolean> => {
  console.log(
    "This log proofs that we are in background.core scrapped repo folder data and send them to backend: ",
    data
  );

  // try {
  //   await fetch(`${apiBaseUrl}/${ApiEndPoint.REPO_FOLDER}`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   console.log(
  //     "Background.core -> Send Repo Folder data to backend successfully"
  //   );
  // } catch (err) {
  //   console.error("Failed to send repo folder data to backend", err);
  //   return false;
  // }
  return true;
};

export const sendRepoFileData = async (
  data: RepoFileData
): Promise<boolean> => {
  console.log(
    "This log proofs that we are in background.core scrapped repo file data and send them to backend: ",
    data
  );

  // try {
  //   await fetch(`${apiBaseUrl}/${ApiEndPoint.REPO_FILE}`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   console.log(
  //     "Background.core -> Send Repo File data to backend successfully"
  //   );
  // } catch (err) {
  //   console.error("Failed to send repo file data to backend : ", err);
  //   return false;
  // }
  return true;
};
