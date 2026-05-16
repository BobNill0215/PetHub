const LEVELS = [
  { level: 1, title: '新晋宠友', icon: '🐣', minPosts: 0, minLikes: 0 },
  { level: 2, title: '初级宠友', icon: '🐥', minPosts: 5, minLikes: 10 },
  { level: 3, title: '中级宠友', icon: '🐰', minPosts: 20, minLikes: 50 },
  { level: 4, title: '高级宠友', icon: '🦊', minPosts: 50, minLikes: 200 },
  { level: 5, title: '宠物达人', icon: '🐱', minPosts: 100, minLikes: 500 },
  { level: 6, title: '宠物专家', icon: '🦁', minPosts: 200, minLikes: 1000 },
  { level: 7, title: '宠圈大神', icon: '🐉', minPosts: 500, minLikes: 5000 },
];

export function getUserLevel(feedCount: number, totalLikes?: number): { level: number; title: string; icon: string } {
  let result = LEVELS[0];
  for (const l of LEVELS) {
    if (feedCount >= l.minPosts) result = l;
  }
  return result;
}

export function getLevelProgress(feedCount: number): { current: number; next: number; level: number; title: string } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (feedCount >= LEVELS[i].minPosts) {
      const nextLv = LEVELS[i + 1];
      return {
        current: feedCount,
        next: nextLv ? nextLv.minPosts : feedCount,
        level: LEVELS[i].level,
        title: LEVELS[i].title,
      };
    }
  }
  return { current: feedCount, next: LEVELS[1].minPosts, level: 1, title: LEVELS[0].title };
}
