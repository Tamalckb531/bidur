import type {
  Enriched,
  ProfileDataPayload,
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
