import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCardSkeleton, StatsSkeleton } from '@/components/ui/loading';
import { BottomNavigation } from '@/components/ui/bottom-nav';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  Users,
  Star,
  ExternalLink
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
  const { toast } = useToast();

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

      if (error) throw error;

      // Transform the data
      const transformedUsers = usersData?.map(user => ({
        id: user.id,
        name: user.name,
        bio: user.bio,
        email: user.email,
        profile_picture: user.profile_picture,
        phone: user.phone,
        location: user.location,
        created_at: user.created_at,
        skills: user.user_skills?.map((us: any) => ({
          id: us.skills?.id,
          name: us.skills?.name,
          category: us.skills?.category,
          is_offering: us.is_offering,
          is_learning: us.is_learning,
          proficiency_level: us.proficiency_level
        })) || []
      })) || [];

      setUsers(transformedUsers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                           user.skills.some(skill => skill.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'technology', 'languages', 'music', 'art', 'sports', 'cooking', 'business'];

  const handleContact = (user: User, method: 'email' | 'phone') => {
    if (method === 'email' && user.email) {
      window.open(`mailto:${user.email}?subject=SkillSwap Connection`, '_blank');
    } else if (method === 'phone' && user.phone) {
      window.open(`tel:${user.phone}`, '_blank');
    } else {
      toast({
        title: "Contact Info Not Available",
        description: `This user hasn't shared their ${method} information.`,
        variant: "destructive",
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SkillSwap
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Profile</Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => supabase.auth.signOut()}
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 md:mb-6">
              <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:gap-4 mb-6 md:mb-8">
              <div className="relative flex-1">
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            <StatsSkeleton className="mb-6 md:mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">
                    <UserCardSkeleton />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SkillSwap
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Profile</Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => supabase.auth.signOut()}
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Find Your Skill Match</h1>
            <p className="text-gray-600 text-sm md:text-base">Discover people who can teach you what you want to learn</p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:gap-4 mb-6 md:mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  <div>
                    <p className="text-lg md:text-2xl font-bold">{filteredUsers.length}</p>
                    <p className="text-xs md:text-sm text-gray-600">Available Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <div>
                    <p className="text-lg md:text-2xl font-bold">
                      {filteredUsers.reduce((total, user) => 
                        total + user.skills.filter(s => s.is_offering).length, 0
                      )}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">Skills Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                  <div>
                    <p className="text-lg md:text-2xl font-bold">
                      {filteredUsers.reduce((total, user) => 
                        total + user.skills.filter(s => s.is_learning).length, 0
                      )}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">Skills Wanted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 ease-in-out">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 md:w-12 md:h-12">
                      <AvatarImage src={user.profile_picture} />
                      <AvatarFallback className="text-sm md:text-base">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg truncate">{user.name}</CardTitle>
                      <CardDescription className="flex items-center text-xs md:text-sm">
                        {user.location && (
                          <>
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{user.location}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-3 line-clamp-2 text-sm md:text-base">{user.bio || "No bio available"}</p>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold mb-1 text-xs md:text-sm text-gray-700">Teaching:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skills
                        .filter(skill => skill.is_offering)
                        .slice(0, 2)
                        .map(skill => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                      {user.skills.filter(skill => skill.is_offering).length === 0 && (
                        <span className="text-xs text-gray-500">No teaching skills listed</span>
                      )}
                      {user.skills.filter(skill => skill.is_offering).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.skills.filter(skill => skill.is_offering).length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold mb-1 text-xs md:text-sm text-gray-700">Learning:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skills
                        .filter(skill => skill.is_learning)
                        .slice(0, 2)
                        .map(skill => (
                          <Badge key={skill.id} variant="outline" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                      {user.skills.filter(skill => skill.is_learning).length === 0 && (
                        <span className="text-xs text-gray-500">No learning skills listed</span>
                      )}
                      {user.skills.filter(skill => skill.is_learning).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.skills.filter(skill => skill.is_learning).length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>Joined {getTimeAgo(user.created_at)}</span>
                    </div>
                    <div className="flex space-x-1">
                      {user.email && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContact(user, 'email')}
                          className="p-1 md:p-2 touch-target"
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                      {user.phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContact(user, 'phone')}
                          className="p-1 md:p-2 touch-target"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                      <Button size="sm" className="p-1 md:p-2 touch-target">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-gray-600 text-sm md:text-base">Try adjusting your search criteria or check back later</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
} 