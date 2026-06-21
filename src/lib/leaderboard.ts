/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  attempts: number;
  avatarUrl?: string;
  isSimulated?: boolean;
}

// Predefined mock top performers for MVP display purposes
const TOP_PERFORMERS: LeaderboardEntry[] = [
  { id: 'sim-1', name: 'Aarav Sharma', score: 98, attempts: 12, isSimulated: true },
  { id: 'sim-2', name: 'Rohan Gupta', score: 94, attempts: 10, isSimulated: true },
  { id: 'sim-3', name: 'Sneha Verma', score: 89, attempts: 8, isSimulated: true },
];

export function getTopPerformers(): LeaderboardEntry[] {
  // In a real app, this would fetch from a database.
  // For the MVP, we merge simulated performers with actual local storage users
  const allUsers = [...TOP_PERFORMERS];
  
  // Try to find any local users with stats
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('student_stats_')) {
      try {
        const stats = JSON.parse(localStorage.getItem(key) || '{}');
        if (stats && stats.attempts && stats.attempts.length > 0) {
          let totalPct = 0;
          stats.attempts.forEach((a: any) => {
            totalPct += (a.score / a.totalQuestions) * 100;
          });
          const avgScore = Math.round(totalPct / stats.attempts.length);
          const userId = key.replace('student_stats_', '');
          
          // Check if user has name in sv_user
          let name = 'Student';
          const userStr = localStorage.getItem('sv_user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            if (userObj.id === userId) {
              name = userObj.name;
            }
          }
          
          allUsers.push({
            id: userId,
            name: name,
            score: avgScore,
            attempts: stats.attempts.length,
            isSimulated: false
          });
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
  }
  
  // Sort descending by score
  allUsers.sort((a, b) => b.score - a.score);
  
  // Return top 3 unique by ID (in case of duplicates)
  const uniqueUsers: LeaderboardEntry[] = [];
  const ids = new Set<string>();
  
  for (const u of allUsers) {
    if (!ids.has(u.id)) {
      ids.add(u.id);
      uniqueUsers.push(u);
    }
    if (uniqueUsers.length >= 3) break;
  }
  
  return uniqueUsers;
}

export function getUserRankAndStats(userId: string): { rank: number; avgScore: number; attempts: number; totalUsers: number } {
  const allUsers = [...TOP_PERFORMERS];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('student_stats_')) {
      try {
        const stats = JSON.parse(localStorage.getItem(key) || '{}');
        if (stats && stats.attempts && stats.attempts.length > 0) {
          let totalPct = 0;
          stats.attempts.forEach((a: any) => {
            totalPct += (a.score / a.totalQuestions) * 100;
          });
          const avgScore = Math.round(totalPct / stats.attempts.length);
          const currentId = key.replace('student_stats_', '');
          
          allUsers.push({
            id: currentId,
            name: 'Student',
            score: avgScore,
            attempts: stats.attempts.length,
            isSimulated: false
          });
        }
      } catch (e) {}
    }
  }
  
  allUsers.sort((a, b) => b.score - a.score);
  
  // Remove duplicate entries
  const uniqueUsers: LeaderboardEntry[] = [];
  const ids = new Set<string>();
  for (const u of allUsers) {
    if (!ids.has(u.id)) {
      ids.add(u.id);
      uniqueUsers.push(u);
    }
  }
  
  const userEntryIndex = uniqueUsers.findIndex(u => u.id === userId);
  const totalUsers = uniqueUsers.length + 124; // Add some fake global volume for better MVP presentation
  
  if (userEntryIndex === -1) {
    return { rank: totalUsers, avgScore: 0, attempts: 0, totalUsers };
  }
  
  return {
    rank: userEntryIndex + 1,
    avgScore: uniqueUsers[userEntryIndex].score,
    attempts: uniqueUsers[userEntryIndex].attempts,
    totalUsers
  };
}
