import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCardSkeleton } from '@/components/ui/loading';
import { BottomNavigation } from '@/components/ui/bottom-nav';
import { Chat } from '@/components/ui/chat';
import { SkillExchangeRequest } from '@/components/ui/skill-exchange';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BookOpen, 
  Search, 
  TrendingUp,
  Users,
  Star,
  ExternalLink,
  MessageCircle,
  User
} from 'lucide-react';

interface User {
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

interface Skill {
  id: string;
  name: string;
  category: string;
  is_offering: boolean;
  is_learning: boolean;
  proficiency_level: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSkillExchange, setShowSkillExchange] = useState(false);
  const { toast } = useToast();
  
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [usersRef, usersInView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch users with their skills
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          bio,
          email,
          profile_picture,
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

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Transform the data
      const transformedUsers = usersData?.map(user => ({
        id: user.id,
        name: user.name,
        bio: user.bio,
        email: user.email,
        profile_picture: user.profile_picture,
        phone: (user as any).phone || null,
        location: (user as any).location || null,
        created_at: user.created_at,
        skills: (user as any).user_skills?.map((us: any) => ({
          id: us.skills.id,
          name: us.skills.name,
          category: us.skills.category,
          is_offering: us.is_offering,
          is_learning: us.is_learning,
          proficiency_level: us.proficiency_level,
        })) || []
      })) || [];

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           user.skills.some(skill => skill.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(users.flatMap(user => user.skills.map(skill => skill.category))))];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
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

      {/* Header Section */}
      <motion.header 
        ref={headerRef}
        className="container mx-auto px-4 py-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
      >
        {/* Top Navigation */}
        <motion.div className="flex justify-between items-center mb-6" variants={itemVariants}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/profile">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => supabase.auth.signOut()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </motion.div>

        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SkillSwap Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover amazing people and start trading skills today
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div className="max-w-4xl mx-auto space-y-4" variants={itemVariants}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for skills, people, or interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 focus:outline-none backdrop-blur-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category === 'all' ? 'All Categories' : category}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.header>

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        className="container mx-auto px-4 py-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
      >
        <motion.div 
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
          variants={itemVariants}
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, number: users.length, label: "Available Users", color: "from-blue-500 to-cyan-500" },
              { icon: Star, number: users.flatMap(u => u.skills).length, label: "Skills Available", color: "from-purple-500 to-pink-500" },
              { icon: TrendingUp, number: Math.floor(users.length * 0.8), label: "Active Exchanges", color: "from-green-500 to-emerald-500" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-purple-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Users Grid */}
      <motion.section 
        ref={usersRef}
        className="container mx-auto px-4 py-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={usersInView ? "visible" : "hidden"}
      >
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  layout
                >
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl h-full overflow-hidden">
                    <CardHeader className="text-center pb-4">
                      <motion.div 
                        className="w-20 h-20 mx-auto mb-4"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="w-20 h-20 border-4 border-white/20">
                          <AvatarImage src={user.profile_picture} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl font-bold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <CardTitle className="text-xl text-white mb-2">{user.name}</CardTitle>
                      <CardDescription className="text-gray-300 text-sm leading-relaxed">
                        {user.bio || 'No bio available'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Skills */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="secondary"
                              className={`text-xs ${
                                skill.is_offering
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              }`}
                            >
                              {skill.name}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-300">
                              +{user.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex gap-2 pt-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            onClick={() => handleMessageUser(user)}
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
                            onClick={() => handleSkillExchange(user)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {!loading && filteredUsers.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or category filters
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </motion.section>

      {/* Bottom Navigation */}
      <BottomNavigation />

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