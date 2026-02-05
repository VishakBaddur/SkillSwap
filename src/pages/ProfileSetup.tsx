import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Check, 
  Plus, 
  Loader2,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';

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

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
  });
  const [teachingSkills, setTeachingSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSave = async () => {
    console.log('handleSave called');
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated:', user.id);

      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      console.log('Profile updated successfully');

      // Add skills
      const allSkills = [...new Set([...teachingSkills, ...learningSkills])];
      
      for (const skillName of allSkills) {
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
          // Add user skill relationships
          const isTeaching = teachingSkills.includes(skillName);
          const isLearning = learningSkills.includes(skillName);

          if (isTeaching) {
            const { error: teachingError } = await supabase
              .from('user_skills')
              .upsert({
                user_id: user.id,
                skill_id: skillData.id,
                is_offering: true,
                is_learning: false,
                proficiency_level: 'intermediate'
              });
            if (teachingError) throw teachingError;
          }

          if (isLearning) {
            const { error: learningError } = await supabase
              .from('user_skills')
              .upsert({
                user_id: user.id,
                skill_id: skillData.id,
                is_offering: false,
                is_learning: true,
                proficiency_level: 'beginner'
              });
            if (learningError) throw learningError;
          }
        }
      }

      console.log('Skills added successfully');
      toast({
        title: "Profile Setup Complete!",
        description: "Your profile has been created successfully.",
      });
      navigate('/home');
    } catch (error: any) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skillName: string, type: 'teaching' | 'learning') => {
    if (type === 'teaching') {
      setTeachingSkills(prev => [...new Set([...prev, skillName])]);
    } else {
      setLearningSkills(prev => [...new Set([...prev, skillName])]);
    }
  };

  const removeSkill = (skillName: string, type: 'teaching' | 'learning') => {
    if (type === 'teaching') {
      setTeachingSkills(prev => prev.filter(s => s !== skillName));
    } else {
      setLearningSkills(prev => prev.filter(s => s !== skillName));
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      predefinedSkills.push({ name: customSkill.trim(), category: 'other' });
      setCustomSkill('');
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                SkillSwap
              </span>
            </Link>
            <div className="text-sm md:text-base text-white/70">
              Step {step} of {totalSteps}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm md:text-base font-medium text-white/90">Setup Progress</span>
              <span className="text-sm md:text-base text-white/70">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 md:h-3">
              <div 
                className="bg-white h-2 md:h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <Card className="glass-card">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-white">
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Skills You Can Teach'}
                {step === 3 && 'Skills You Want to Learn'}
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-white/70">
                {step === 1 && 'Tell us about yourself to get started'}
                {step === 2 && 'What skills can you offer to others?'}
                {step === 3 && 'What skills would you like to learn from others?'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base text-white/90">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="text-sm md:text-base bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="text-sm md:text-base text-white/90">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="text-sm md:text-base bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm md:text-base text-white/90">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                      className="text-sm md:text-base bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm md:text-base text-white/90">Location (optional)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="text-sm md:text-base bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm md:text-base mb-3 block">Select skills you can teach:</Label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto smooth-scroll">
                      {predefinedSkills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant={teachingSkills.includes(skill.name) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-green-50 text-xs touch-target"
                          onClick={() => {
                            if (teachingSkills.includes(skill.name)) {
                              removeSkill(skill.name, 'teaching');
                            } else {
                              addSkill(skill.name, 'teaching');
                            }
                          }}
                        >
                          {skill.name}
                          {teachingSkills.includes(skill.name) && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Add a custom skill"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                      className="text-sm"
                    />
                    <Button onClick={addCustomSkill} size="sm" className="touch-target">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {teachingSkills.length > 0 && (
                    <div>
                      <Label className="text-sm md:text-base mb-2 block">Selected teaching skills:</Label>
                      <div className="flex flex-wrap gap-2">
                        {teachingSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm md:text-base mb-3 block">Select skills you want to learn:</Label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto smooth-scroll">
                      {predefinedSkills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant={learningSkills.includes(skill.name) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-blue-50 text-xs touch-target"
                          onClick={() => {
                            if (learningSkills.includes(skill.name)) {
                              removeSkill(skill.name, 'learning');
                            } else {
                              addSkill(skill.name, 'learning');
                            }
                          }}
                        >
                          {skill.name}
                          {learningSkills.includes(skill.name) && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Add a custom skill"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                      className="text-sm"
                    />
                    <Button onClick={addCustomSkill} size="sm" className="touch-target">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {learningSkills.length > 0 && (
                    <div>
                      <Label className="text-sm md:text-base mb-2 block">Selected learning skills:</Label>
                      <div className="flex flex-wrap gap-2">
                        {learningSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(prev => Math.max(1, prev - 1))}
                  disabled={step === 1}
                  className="touch-target"
                >
                  Previous
                </Button>
                
                {step < totalSteps ? (
                  <Button
                    onClick={() => setStep(prev => prev + 1)}
                    className="touch-target"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      console.log('Complete Setup button clicked');
                      handleSave();
                    }}
                    disabled={loading}
                    className="touch-target"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing Setup...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Preview */}
          {(step === 2 || step === 3) && (
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    <div>
                      <p className="text-lg md:text-2xl font-bold text-white">{teachingSkills.length}</p>
                      <p className="text-xs md:text-sm text-white/70">Teaching Skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    <div>
                      <p className="text-lg md:text-2xl font-bold text-white">{learningSkills.length}</p>
                      <p className="text-xs md:text-sm text-white/70">Learning Skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    <div>
                      <p className="text-lg md:text-2xl font-bold text-white">{teachingSkills.length + learningSkills.length}</p>
                      <p className="text-xs md:text-sm text-white/70">Total Skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 