export interface User {
  id: string;
  name: string;
  bio: string;
  email: string;
  profile_picture?: string;
  phone?: string;
  location?: string;
  created_at: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  is_offering: boolean;
  is_learning: boolean;
  proficiency_level: string;
}

export interface MatchScore {
  user: User;
  score: number;
  reasons: string[];
  mutualSkills: {
    teaching: string[];
    learning: string[];
  };
}

import { performanceLogger } from './performance';

export function calculateMatchScore(currentUser: User, targetUser: User): MatchScore {
  return performanceLogger.measureSync(
    'calculateMatchScore',
    () => {
      let score = 0;
      const reasons: string[] = [];
      const mutualSkills = {
        teaching: [] as string[],
        learning: [] as string[]
      };

      // Get current user's learning skills (what they want to learn)
      const currentUserLearningSkills = currentUser.skills
        .filter(skill => skill.is_learning)
        .map(skill => skill.name.toLowerCase());

      // Get current user's teaching skills (what they can teach)
      const currentUserTeachingSkills = currentUser.skills
        .filter(skill => skill.is_offering)
        .map(skill => skill.name.toLowerCase());

      // Get target user's teaching skills (what they can teach)
      const targetUserTeachingSkills = targetUser.skills
        .filter(skill => skill.is_offering)
        .map(skill => skill.name.toLowerCase());

      // Get target user's learning skills (what they want to learn)
      const targetUserLearningSkills = targetUser.skills
        .filter(skill => skill.is_learning)
        .map(skill => skill.name.toLowerCase());

      // Calculate mutual teaching/learning matches
      const teachingMatches = currentUserLearningSkills.filter(skill => 
        targetUserTeachingSkills.includes(skill)
      );
      
      const learningMatches = currentUserTeachingSkills.filter(skill => 
        targetUserLearningSkills.includes(skill)
      );

      // Add mutual skills to the result
      mutualSkills.teaching = teachingMatches;
      mutualSkills.learning = learningMatches;

      // Score based on mutual skills
      score += teachingMatches.length * 30; // High weight for teaching matches
      score += learningMatches.length * 25; // High weight for learning matches

      if (teachingMatches.length > 0) {
        reasons.push(`Can teach you: ${teachingMatches.join(', ')}`);
      }
      
      if (learningMatches.length > 0) {
        reasons.push(`Wants to learn: ${learningMatches.join(', ')}`);
      }

      // Bonus for multiple matches
      if (teachingMatches.length > 1) {
        score += 15;
        reasons.push('Multiple teaching skills match!');
      }
      
      if (learningMatches.length > 1) {
        score += 10;
        reasons.push('Multiple learning interests match!');
      }

      // Location bonus (if both users have location)
      if (currentUser.location && targetUser.location) {
        const currentLocation = currentUser.location.toLowerCase();
        const targetLocation = targetUser.location.toLowerCase();
        
        if (currentLocation === targetLocation) {
          score += 20;
          reasons.push('Same location - easy to meet up!');
        } else if (currentLocation.includes(targetLocation.split(',')[0]) || 
                   targetLocation.includes(currentLocation.split(',')[0])) {
          score += 10;
          reasons.push('Nearby location');
        }
      }

      // Category diversity bonus
      const currentUserCategories = new Set(currentUser.skills.map(skill => skill.category));
      const targetUserCategories = new Set(targetUser.skills.map(skill => skill.category));
      const sharedCategories = new Set([...currentUserCategories].filter(cat => targetUserCategories.has(cat)));
      
      if (sharedCategories.size > 0) {
        score += sharedCategories.size * 5;
        reasons.push(`Shared interests in: ${Array.from(sharedCategories).join(', ')}`);
      }

      // Profile completeness bonus
      let profileCompleteness = 0;
      if (targetUser.bio && targetUser.bio.length > 20) profileCompleteness += 1;
      if (targetUser.profile_picture) profileCompleteness += 1;
      if (targetUser.location) profileCompleteness += 1;
      if (targetUser.phone) profileCompleteness += 1;
      
      score += profileCompleteness * 3;
      if (profileCompleteness >= 3) {
        reasons.push('Complete profile - easy to connect!');
      }

      // Skill level matching bonus
      const currentUserSkillLevels = currentUser.skills.reduce((acc, skill) => {
        acc[skill.name.toLowerCase()] = skill.proficiency_level;
        return acc;
      }, {} as Record<string, string>);

      const targetUserSkillLevels = targetUser.skills.reduce((acc, skill) => {
        acc[skill.name.toLowerCase()] = skill.proficiency_level;
        return acc;
      }, {} as Record<string, string>);

      let skillLevelMatches = 0;
      teachingMatches.forEach(skill => {
        const currentLevel = currentUserSkillLevels[skill];
        const targetLevel = targetUserSkillLevels[skill];
        
        if (currentLevel && targetLevel) {
          // Prefer complementary skill levels (beginner learning from expert, etc.)
          if ((currentLevel === 'beginner' && targetLevel === 'expert') ||
              (currentLevel === 'intermediate' && targetLevel === 'expert') ||
              (currentLevel === 'beginner' && targetLevel === 'intermediate')) {
            skillLevelMatches += 1;
          }
        }
      });

      if (skillLevelMatches > 0) {
        score += skillLevelMatches * 8;
        reasons.push('Great skill level match!');
      }

      // Ensure score is between 0 and 100
      score = Math.min(Math.max(score, 0), 100);

      return {
        user: targetUser,
        score,
        reasons,
        mutualSkills
      };
    },
    {
      currentUserId: currentUser.id,
      targetUserId: targetUser.id,
      currentUserSkillsCount: currentUser.skills.length,
      targetUserSkillsCount: targetUser.skills.length,
    }
  );
}

export function getTopMatches(currentUser: User, allUsers: User[], limit: number = 10): MatchScore[] {
  return performanceLogger.measureSync(
    'getTopMatches',
    () => {
      const matches = allUsers
        .filter(user => user.id !== currentUser.id) // Exclude current user
        .map(user => calculateMatchScore(currentUser, user))
        .filter(match => match.score > 0) // Only include users with some match
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, limit); // Take top matches

      return matches;
    },
    {
      currentUserId: currentUser.id,
      totalUsers: allUsers.length,
      limit,
    }
  );
}

export function getMatchQuality(score: number): { level: string; color: string; description: string } {
  if (score >= 80) {
    return {
      level: 'Excellent',
      color: 'text-green-600',
      description: 'Perfect match! You have many complementary skills.'
    };
  } else if (score >= 60) {
    return {
      level: 'Great',
      color: 'text-blue-600',
      description: 'Great match! You have good skill compatibility.'
    };
  } else if (score >= 40) {
    return {
      level: 'Good',
      color: 'text-yellow-600',
      description: 'Good match! You have some complementary skills.'
    };
  } else if (score >= 20) {
    return {
      level: 'Fair',
      color: 'text-orange-600',
      description: 'Fair match. You might have some skills to exchange.'
    };
  } else {
    return {
      level: 'Low',
      color: 'text-gray-600',
      description: 'Limited match. Consider expanding your skill profile.'
    };
  }
}
