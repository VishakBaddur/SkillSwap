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

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                SkillSwap
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/profile">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => supabase.auth.signOut()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
              SkillSwap Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing people and start trading skills today
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for skills, people, or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-gray-900 focus:outline-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, number: users.length, label: "Available Users", color: "text-gray-900" },
              { icon: Star, number: users.flatMap(u => u.skills).length, label: "Skills Available", color: "text-gray-900" },
              { icon: TrendingUp, number: Math.floor(users.length * 0.8), label: "Active Exchanges", color: "text-gray-900" }
            ].map((stat, index) => (
              <div key={index}>
                <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold mb-2 text-gray-900">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Users Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ 
                    y: -5,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                >
                  <Card className="border border-gray-200 shadow-sm bg-white h-full hover:shadow-md transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <div className="w-20 h-20 mx-auto mb-4">
                        <Avatar className="w-20 h-20 border-2 border-gray-200">
                          <AvatarImage src={user.profile_picture} />
                          <AvatarFallback className="bg-gray-100 text-gray-900 text-xl font-semibold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-xl text-gray-900 mb-2">{user.name}</CardTitle>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed">
                        {user.bio || 'No bio available'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Skills */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="secondary"
                              className={`text-xs ${
                                skill.is_offering
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {skill.name}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              +{user.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-black text-white hover:bg-gray-800"
                          onClick={() => handleMessageUser(user)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleSkillExchange(user)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or category filters
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-black text-white hover:bg-gray-800"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </section>

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
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
