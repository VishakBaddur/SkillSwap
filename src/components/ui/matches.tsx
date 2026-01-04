import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Chat } from '@/components/ui/chat';
import { SkillExchangeRequest } from '@/components/ui/skill-exchange';
import { supabase } from '@/lib/supabase';
import { getTopMatches, getMatchQuality, MatchScore } from '@/lib/matching';
import { 
  Star, 
  MessageCircle, 
  ExternalLink, 
  Sparkles, 
  TrendingUp,
  Users,
  MapPin,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  bio: string;
  email: string;
  profile_picture?: string;
  phone?: string;
  location?: string;
  created_at: string;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    is_offering: boolean;
    is_learning: boolean;
    proficiency_level: string;
  }>;
}

export function Matches() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSkillExchange, setShowSkillExchange] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUserAndMatches();
  }, []);

  const fetchCurrentUserAndMatches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current user with skills
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          bio,
          email,
          profile_picture,
          phone,
          location,
          created_at,
          user_skills (
            id,
            is_offering,
            is_learning,
            proficiency_level,
            skills (
              id,
              name,
              category
            )
          )
        `)
        .eq('id', user.id)
        .single();

      if (currentUserError) throw currentUserError;

      const transformedCurrentUser = {
        id: currentUserData.id,
        name: currentUserData.name,
        bio: currentUserData.bio,
        email: currentUserData.email,
        profile_picture: currentUserData.profile_picture,
        phone: currentUserData.phone,
        location: currentUserData.location,
        created_at: currentUserData.created_at,
        skills: (currentUserData as any).user_skills?.map((us: any) => ({
          id: us.skills?.id,
          name: us.skills?.name,
          category: us.skills?.category,
          is_offering: us.is_offering,
          is_learning: us.is_learning,
          proficiency_level: us.proficiency_level,
        })) || []
      };

      setCurrentUser(transformedCurrentUser);

      // Fetch all other users with skills
      const { data: allUsersData, error: allUsersError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          bio,
          email,
          profile_picture,
          phone,
          location,
          created_at,
          user_skills (
            id,
            is_offering,
            is_learning,
            proficiency_level,
            skills (
              id,
              name,
              category
            )
          )
        `)
        .neq('id', user.id);

      if (allUsersError) throw allUsersError;

      const transformedAllUsers = allUsersData?.map(user => ({
        id: user.id,
        name: user.name,
        bio: user.bio,
        email: user.email,
        profile_picture: user.profile_picture,
        phone: user.phone,
        location: user.location,
        created_at: user.created_at,
        skills: (user as any).user_skills?.map((us: any) => ({
          id: us.skills?.id,
          name: us.skills?.name,
          category: us.skills?.category,
          is_offering: us.is_offering,
          is_learning: us.is_learning,
          proficiency_level: us.proficiency_level,
        })) || []
      })) || [];

      // Calculate matches
      const topMatches = getTopMatches(transformedCurrentUser, transformedAllUsers, 20);
      setMatches(topMatches);

    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUser = (user: User) => {
    setSelectedUser(user);
    setShowChat(true);
    setShowSkillExchange(false);
  };

  const handleSkillExchange = (user: User) => {
    setSelectedUser(user);
    setShowSkillExchange(true);
    setShowChat(false);
  };

  const closeModals = () => {
    setShowChat(false);
    setShowSkillExchange(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Unable to load your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gray-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gray-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
            Your Perfect Matches
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We've found {matches.length} amazing people who match your skills and interests
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { icon: Users, number: matches.length, label: "Total Matches", color: "from-gray-400 to-gray-600" },
            { icon: Star, number: matches.filter(m => m.score >= 80).length, label: "Excellent Matches", color: "from-gray-500 to-gray-700" },
            { icon: TrendingUp, number: matches.filter(m => m.score >= 60).length, label: "Great Matches", color: "from-gray-500 to-gray-700" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Matches Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence>
            {matches.map((match, index) => {
              const quality = getMatchQuality(match.score);
              return (
                <motion.div
                  key={match.user.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                >
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl h-full overflow-hidden">
                    <CardHeader className="text-center pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`${quality.color} bg-opacity-20 border-0`}>
                          {quality.level} Match
                        </Badge>
                        <div className="text-2xl font-bold text-white">
                          {match.score}%
                        </div>
                      </div>
                      
                      <motion.div 
                        className="w-20 h-20 mx-auto mb-4"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="w-20 h-20 border-4 border-white/20">
                          <AvatarImage src={match.user.profile_picture} />
                          <AvatarFallback className="bg-gradient-to-r from-gray-400 to-gray-600 text-white text-2xl font-bold">
                            {match.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      
                      <CardTitle className="text-xl text-white mb-2">{match.user.name}</CardTitle>
                      <CardDescription className="text-gray-300 text-sm leading-relaxed">
                        {match.user.bio || 'No bio available'}
                      </CardDescription>
                      
                      {match.user.location && (
                        <div className="flex items-center justify-center text-gray-400 text-sm mt-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {match.user.location}
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Match Reasons */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">Why you match:</h4>
                        <div className="space-y-1">
                          {match.reasons.slice(0, 3).map((reason: string, reasonIndex: number) => (
                            <div key={reasonIndex} className="flex items-center text-xs text-gray-300">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-400 flex-shrink-0" />
                              <span className="truncate">{reason}</span>
                            </div>
                          ))}
                          {match.reasons.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{match.reasons.length - 3} more reasons
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mutual Skills */}
                      {(match.mutualSkills.teaching.length > 0 || match.mutualSkills.learning.length > 0) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-white">Mutual Skills:</h4>
                          <div className="flex flex-wrap gap-1">
                            {match.mutualSkills.teaching.slice(0, 2).map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                                {skill}
                              </Badge>
                            ))}
                            {match.mutualSkills.learning.slice(0, 2).map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs bg-gray-400/20 text-blue-300 border-blue-500/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white"
                            onClick={() => handleMessageUser(match.user)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={() => handleSkillExchange(match.user)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {matches.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-500/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
            <p className="text-gray-400 mb-6">
              Try adding more skills to your profile to find better matches
            </p>
            <Button className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800">
              <ArrowRight className="w-4 h-4 mr-2" />
              Update Profile
            </Button>
          </motion.div>
        )}
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Chat
                userId={selectedUser.id}
                userName={selectedUser.name}
                userProfilePicture={selectedUser.profile_picture}
                onClose={closeModals}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skill Exchange Modal */}
      <AnimatePresence>
        {showSkillExchange && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SkillExchangeRequest
                userId={selectedUser.id}
                userName={selectedUser.name}
                userProfilePicture={selectedUser.profile_picture}
                userSkills={selectedUser.skills}
                onClose={closeModals}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
