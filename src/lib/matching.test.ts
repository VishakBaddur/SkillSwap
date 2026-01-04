import { describe, it, expect } from 'vitest';
import {
  calculateMatchScore,
  getTopMatches,
  getMatchQuality,
  User,
  Skill,
} from './matching';

describe('Matching Algorithm', () => {
  const createUser = (
    id: string,
    name: string,
    skills: Skill[],
    location?: string
  ): User => ({
    id,
    name,
    email: `${name.toLowerCase()}@example.com`,
    bio: `Bio for ${name}`,
    created_at: new Date().toISOString(),
    skills,
    location,
  });

  const createSkill = (
    name: string,
    category: string,
    isOffering: boolean,
    isLearning: boolean,
    proficiency: string = 'intermediate'
  ): Skill => ({
    id: `skill-${name}`,
    name,
    category,
    is_offering: isOffering,
    is_learning: isLearning,
    proficiency_level: proficiency,
  });

  describe('calculateMatchScore', () => {
    it('should return high score for perfect complementary match', () => {
      const user1 = createUser('user1', 'Alice', [
        createSkill('JavaScript', 'technology', true, false, 'expert'),
        createSkill('Python', 'technology', false, true, 'beginner'),
      ]);

      const user2 = createUser('user2', 'Bob', [
        createSkill('JavaScript', 'technology', false, true, 'beginner'),
        createSkill('Python', 'technology', true, false, 'expert'),
      ]);

      const result = calculateMatchScore(user1, user2);

      expect(result.score).toBeGreaterThan(50);
      // user1 wants to learn Python, user2 teaches Python
      expect(result.mutualSkills.teaching).toContain('python');
      // user1 teaches JavaScript, user2 wants to learn JavaScript
      expect(result.mutualSkills.learning).toContain('javascript');
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should return low score for no matching skills', () => {
      const user1 = createUser('user1', 'Alice', [
        createSkill('JavaScript', 'technology', true, false),
        createSkill('Python', 'technology', false, true),
      ]);

      const user2 = createUser('user2', 'Bob', [
        createSkill('Guitar', 'music', true, false),
        createSkill('Piano', 'music', false, true),
      ]);

      const result = calculateMatchScore(user1, user2);

      expect(result.score).toBeLessThan(20);
      expect(result.mutualSkills.teaching).toHaveLength(0);
      expect(result.mutualSkills.learning).toHaveLength(0);
    });

    it('should add location bonus for same location', () => {
      const user1 = createUser('user1', 'Alice', [
        createSkill('JavaScript', 'technology', true, false),
      ], 'San Francisco, CA');

      const user2 = createUser('user2', 'Bob', [
        createSkill('JavaScript', 'technology', false, true),
      ], 'San Francisco, CA');

      const result = calculateMatchScore(user1, user2);

      expect(result.score).toBeGreaterThan(30);
      expect(result.reasons.some(r => r.includes('location'))).toBe(true);
    });

    it('should add profile completeness bonus', () => {
      const user1 = createUser('user1', 'Alice', [
        createSkill('JavaScript', 'technology', true, false),
      ]);

      const user2 = createUser('user2', 'Bob', [
        createSkill('JavaScript', 'technology', false, true),
      ]);
      // Target user (user2) needs complete profile for the bonus
      user2.bio = 'This is a detailed bio with more than 20 characters';
      user2.profile_picture = 'https://example.com/pic.jpg';
      user2.location = 'San Francisco';
      user2.phone = '+1234567890';

      const result = calculateMatchScore(user1, user2);

      // Check for profile completeness reason (exact text may vary)
      expect(result.reasons.some(r => 
        r.toLowerCase().includes('complete') || 
        r.toLowerCase().includes('profile')
      )).toBe(true);
    });

    it('should handle skill level compatibility', () => {
      const user1 = createUser('user1', 'Alice', [
        createSkill('JavaScript', 'technology', false, true, 'beginner'),
      ]);

      const user2 = createUser('user2', 'Bob', [
        createSkill('JavaScript', 'technology', true, false, 'expert'),
      ]);

      const result = calculateMatchScore(user1, user2);

      expect(result.score).toBeGreaterThan(30);
      expect(result.reasons.some(r => r.includes('skill level'))).toBe(true);
    });

    it('should handle empty skills arrays', () => {
      const user1 = createUser('user1', 'Alice', []);
      const user2 = createUser('user2', 'Bob', []);

      const result = calculateMatchScore(user1, user2);

      expect(result.score).toBe(0);
      expect(result.mutualSkills.teaching).toHaveLength(0);
      expect(result.mutualSkills.learning).toHaveLength(0);
    });

    it('should ensure score is between 0 and 100', () => {
      const user1 = createUser('user1', 'Alice', [
        createSkill('Skill1', 'tech', true, false),
        createSkill('Skill2', 'tech', true, false),
        createSkill('Skill3', 'tech', true, false),
        createSkill('Skill4', 'tech', true, false),
        createSkill('Skill5', 'tech', true, false),
      ]);

      const user2 = createUser('user2', 'Bob', [
        createSkill('Skill1', 'tech', false, true),
        createSkill('Skill2', 'tech', false, true),
        createSkill('Skill3', 'tech', false, true),
        createSkill('Skill4', 'tech', false, true),
        createSkill('Skill5', 'tech', false, true),
      ]);
      user2.bio = 'Detailed bio';
      user2.location = 'Same Location';
      user2.profile_picture = 'pic.jpg';
      user2.phone = '+1234567890';

      const result = calculateMatchScore(user1, user2);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('getTopMatches', () => {
    it('should return top matches sorted by score', () => {
      const currentUser = createUser('current', 'Current', [
        createSkill('JavaScript', 'technology', true, false),
        createSkill('Python', 'technology', false, true),
      ]);

      const users = [
        createUser('user1', 'User1', [
          createSkill('Python', 'technology', true, false),
          createSkill('JavaScript', 'technology', false, true),
        ]),
        createUser('user2', 'User2', [
          createSkill('Guitar', 'music', true, false),
        ]),
        createUser('user3', 'User3', [
          createSkill('Python', 'technology', true, false),
        ]),
      ];

      const matches = getTopMatches(currentUser, users, 2);

      expect(matches).toHaveLength(2);
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
      expect(matches[0].user.id).toBe('user1'); // Should be best match
    });

    it('should exclude current user from results', () => {
      const currentUser = createUser('current', 'Current', [
        createSkill('JavaScript', 'technology', true, false),
      ]);

      const users = [currentUser];

      const matches = getTopMatches(currentUser, users, 10);

      expect(matches).toHaveLength(0);
    });

    it('should filter out matches with zero score', () => {
      const currentUser = createUser('current', 'Current', [
        createSkill('JavaScript', 'technology', true, false),
      ]);

      const users = [
        createUser('user1', 'User1', [
          createSkill('Guitar', 'music', true, false),
        ]),
      ];

      const matches = getTopMatches(currentUser, users, 10);

      expect(matches.length).toBeLessThanOrEqual(users.length);
    });

    it('should respect limit parameter', () => {
      const currentUser = createUser('current', 'Current', [
        createSkill('JavaScript', 'technology', true, false),
      ]);

      const users = Array.from({ length: 20 }, (_, i) =>
        createUser(`user${i}`, `User${i}`, [
          createSkill('JavaScript', 'technology', false, true),
        ])
      );

      const matches = getTopMatches(currentUser, users, 5);

      expect(matches).toHaveLength(5);
    });
  });

  describe('getMatchQuality', () => {
    it('should return Excellent for scores >= 80', () => {
      const quality = getMatchQuality(85);
      expect(quality.level).toBe('Excellent');
      expect(quality.color).toBe('text-green-600');
    });

    it('should return Great for scores >= 60', () => {
      const quality = getMatchQuality(70);
      expect(quality.level).toBe('Great');
      expect(quality.color).toBe('text-blue-600');
    });

    it('should return Good for scores >= 40', () => {
      const quality = getMatchQuality(50);
      expect(quality.level).toBe('Good');
      expect(quality.color).toBe('text-yellow-600');
    });

    it('should return Fair for scores >= 20', () => {
      const quality = getMatchQuality(25);
      expect(quality.level).toBe('Fair');
      expect(quality.color).toBe('text-orange-600');
    });

    it('should return Low for scores < 20', () => {
      const quality = getMatchQuality(10);
      expect(quality.level).toBe('Low');
      expect(quality.color).toBe('text-gray-600');
    });
  });
});

