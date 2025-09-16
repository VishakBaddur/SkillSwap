import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileSkeleton, StatsSkeleton } from '@/components/ui/loading';
import { BottomNavigation } from '@/components/ui/bottom-nav';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Phone, 
  MapPin,
  TrendingUp,
  Users,
  Star,
  Calendar,
  Check,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  bio: string;
  email: string;
  profile_picture?: string;
  created_at: string;
  phone?: string;
  location?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  is_offering: boolean;
  is_learning: boolean;
  proficiency_level: string;
}

const predefinedSkills = [
  { name: 'JavaScript', category: 'technology' },
  { name: 'Python', category: 'technology' },
  { name: 'React', category: 'technology' },
  { name: 'Node.js', category: 'technology' },
  { name: 'TypeScript', category: 'technology' },
  { name: 'SQL', category: 'technology' },
  { name: 'Spanish', category: 'languages' },
  { name: 'French', category: 'languages' },
  { name: 'German', category: 'languages' },
  { name: 'Italian', category: 'languages' },
  { name: 'Guitar', category: 'music' },
  { name: 'Piano', category: 'music' },
  { name: 'Violin', category: 'music' },
  { name: 'Singing', category: 'music' },
  { name: 'Photography', category: 'art' },
  { name: 'Drawing', category: 'art' },
  { name: 'Painting', category: 'art' },
  { name: 'Digital Art', category: 'art' },
  { name: 'Cooking', category: 'cooking' },
  { name: 'Baking', category: 'cooking' },
  { name: 'Yoga', category: 'sports' },
  { name: 'Tennis', category: 'sports' },
  { name: 'Swimming', category: 'sports' },
  { name: 'Running', category: 'sports' },
  { name: 'Marketing', category: 'business' },
  { name: 'Public Speaking', category: 'business' },
  { name: 'Project Management', category: 'business' },
  { name: 'Sales', category: 'business' },
  { name: 'Writing', category: 'creative' },
  { name: 'Video Editing', category: 'creative' },
  { name: 'Graphic Design', category: 'creative' },
  { name: 'Web Design', category: 'creative' },
];

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [customSkill, setCustomSkill] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) throw userError;

      setUser(userData);
      setEditForm({
        name: userData.name || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        location: userData.location || '',
      });

      // Fetch user skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          id,
          is_offering,
          is_learning,
          proficiency_level,
          skills (
            id,
            name,
            category
          )
        `)
        .eq('user_id', authUser.id);

      if (skillsError) throw skillsError;

      const transformedSkills = skillsData?.map((us: any) => ({
        id: us.skills?.id,
        name: us.skills?.name,
        category: us.skills?.category,
        is_offering: us.is_offering,
        is_learning: us.is_learning,
        proficiency_level: us.proficiency_level
      })) || [];

      setSkills(transformedSkills);
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

  const handleSave = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from('users')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          phone: editForm.phone,
          location: editForm.location,
        })
        .eq('id', authUser.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...editForm } : null);
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = async (skillName: string, isOffering: boolean, isLearning: boolean) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Check if skill exists, if not create it
      let { data: skillData } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skillName)
        .single();

      if (!skillData) {
        const { data: newSkill, error: skillError } = await supabase
          .from('skills')
          .insert({ name: skillName, category: 'other' })
          .select('id')
          .single();
        
        if (skillError) throw skillError;
        skillData = newSkill;
      }

      if (skillData) {
        // Add or update user skill relationship
        const { error: userSkillError } = await supabase
          .from('user_skills')
          .upsert({
            user_id: authUser.id,
            skill_id: skillData.id,
            is_offering: isOffering,
            is_learning: isLearning,
            proficiency_level: 'intermediate'
          });

        if (userSkillError) throw userSkillError;

        // Refresh skills
        await fetchProfile();
        toast({
          title: "Success",
          description: `${skillName} added successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', authUser.id)
        .eq('skill_id', skillId);

      if (error) throw error;

      // Refresh skills
      await fetchProfile();
      toast({
        title: "Success",
        description: "Skill removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      predefinedSkills.push({ name: customSkill.trim(), category: 'other' });
      setCustomSkill('');
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast({
          title: "Error",
          description: "New password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SkillSwap
                </span>
              </Link>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link to="/home">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Home</Button>
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

        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm mb-6 md:mb-8">
              <CardContent className="p-4 md:p-8">
                <ProfileSkeleton />
              </CardContent>
            </Card>

            <StatsSkeleton className="mb-6 md:mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </Link>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/home">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Home</Button>
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

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="bg-white/80 backdrop-blur-sm mb-6 md:mb-8">
            <CardContent className="p-4 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-0">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 mx-auto sm:mx-0">
                    <AvatarImage src={user.profile_picture} />
                    <AvatarFallback className="text-xl md:text-2xl">{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.name}</h1>
                    <p className="text-gray-600 mb-2 text-sm md:text-base">{user.email}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                      {user.location && (
                        <div className="flex items-center justify-center sm:justify-start">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center sm:justify-start">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="w-full sm:w-auto touch-target"
                >
                  {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span className="ml-2 hidden sm:inline">{editing ? 'Cancel' : 'Edit'}</span>
                </Button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="text-sm md:text-base">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm md:text-base">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm md:text-base">Location (optional)</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button onClick={handleSave} className="w-full sm:w-auto touch-target">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="w-full sm:w-auto touch-target">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 mb-4 text-sm md:text-base">{user.bio || "No bio yet. Click edit to add one!"}</p>
                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <Card className="bg-white/80 backdrop-blur-sm mb-6 md:mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Lock className="w-5 h-5 mr-2 text-red-600" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Update your account password
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="touch-target"
                >
                  {showPasswordChange ? <X className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="ml-2 hidden sm:inline">{showPasswordChange ? 'Cancel' : 'Change'}</span>
                </Button>
              </div>
            </CardHeader>
            {showPasswordChange && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-password" className="text-sm md:text-base">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="text-sm md:text-base pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirm-password" className="text-sm md:text-base">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="text-sm md:text-base pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button onClick={handlePasswordChange} className="w-full sm:w-auto touch-target">
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordChange(false)} className="w-full sm:w-auto touch-target">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{skills.filter(s => s.is_offering).length}</p>
                    <p className="text-xs md:text-sm text-gray-600">Skills Teaching</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{skills.filter(s => s.is_learning).length}</p>
                    <p className="text-xs md:text-sm text-gray-600">Skills Learning</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{skills.length}</p>
                    <p className="text-xs md:text-sm text-gray-600">Total Skills</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Teaching Skills */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Skills I'm Teaching
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Skills you can offer to others
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSkills(!editingSkills)}
                    className="touch-target"
                  >
                    {editingSkills ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editingSkills && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto smooth-scroll">
                      {predefinedSkills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant={skills.some(s => s.name === skill.name && s.is_offering) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-green-50 text-xs touch-target"
                          onClick={() => handleAddSkill(skill.name, true, false)}
                        >
                          {skill.name}
                          {skills.some(s => s.name === skill.name && s.is_offering) && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="Add a custom skill"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                        className="text-sm"
                      />
                      <Button onClick={handleAddCustomSkill} size="sm" className="touch-target">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {skills.filter(skill => skill.is_offering).length > 0 ? (
                  <div className="space-y-2">
                    {skills
                      .filter(skill => skill.is_offering)
                      .map(skill => (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm md:text-base truncate">{skill.name}</p>
                            <p className="text-xs md:text-sm text-gray-600">{skill.category}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="secondary" className="text-xs">{skill.proficiency_level}</Badge>
                            {editingSkills && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSkill(skill.id)}
                                className="touch-target"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <p className="text-gray-500 mb-4 text-sm">No teaching skills yet</p>
                    {!editingSkills && (
                      <Button size="sm" onClick={() => setEditingSkills(true)} className="touch-target">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Skills
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Skills */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Skills I'm Learning
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Skills you want to learn from others
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSkills(!editingSkills)}
                    className="touch-target"
                  >
                    {editingSkills ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editingSkills && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto smooth-scroll">
                      {predefinedSkills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant={skills.some(s => s.name === skill.name && s.is_learning) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-blue-50 text-xs touch-target"
                          onClick={() => handleAddSkill(skill.name, false, true)}
                        >
                          {skill.name}
                          {skills.some(s => s.name === skill.name && s.is_learning) && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="Add a custom skill"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                        className="text-sm"
                      />
                      <Button onClick={handleAddCustomSkill} size="sm" className="touch-target">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {skills.filter(skill => skill.is_learning).length > 0 ? (
                  <div className="space-y-2">
                    {skills
                      .filter(skill => skill.is_learning)
                      .map(skill => (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm md:text-base truncate">{skill.name}</p>
                            <p className="text-xs md:text-sm text-gray-600">{skill.category}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="outline" className="text-xs">{skill.proficiency_level}</Badge>
                            {editingSkills && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSkill(skill.id)}
                                className="touch-target"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <p className="text-gray-500 mb-4 text-sm">No learning skills yet</p>
                    {!editingSkills && (
                      <Button size="sm" onClick={() => setEditingSkills(true)} className="touch-target">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Skills
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
} 