/**
 *  Services for handling GitHub API
 */

import { AWS_API_URL } from "./constants";
// Fetches data from GitHub's GraphQL API via custom AWS function
export async function fetchContributions(username, year) {
    try {
        const data = await fetch(
            `${AWS_API_URL}?username=${username}&year=${year}`,
        );
        const json = await data.json();
        return json?.user?.contributionsCollection?.contributionCalendar?.weeks; // 🙄
    } catch {}
    return null;
}

// Takes the contributions data from GitHub API and converts them to a 2D array (empty days in the year are replaced with -1)
export function getConvertedContributions(contribs) {
    const result = [];
    // Get 2D array filled with -1
    for (let i = 0; i < 7; i++) {
        const row = [];
        for (let j = 0; j < contribs.length; j++) {
            row.push(-1);
        }
        result.push(row);
    }

    for (let i = 0; i < contribs.length; i++) {
        for (const day of contribs[i].contributionDays) {
            result[day.weekday][i] = day.contributionCount;
        }
    }
    return result;
}
