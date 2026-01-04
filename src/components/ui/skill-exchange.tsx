import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  Star,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface SkillExchangeRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  skill_to_learn: string;
  skill_to_teach: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  requester?: {
    name: string;
    profile_picture?: string;
  };
  receiver?: {
    name: string;
    profile_picture?: string;
  };
}

interface SkillExchangeProps {
  userId: string;
  userName: string;
  userProfilePicture?: string;
  userSkills: Array<{
    name: string;
    is_offering: boolean;
    is_learning: boolean;
  }>;
  onClose: () => void;
}

export function SkillExchangeRequest({ userId, userName, userProfilePicture, userSkills, onClose }: SkillExchangeProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    skillToLearn: '',
    skillToTeach: '',
    message: '',
    preferredTime: '',
    location: ''
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.skillToLearn || !requestForm.skillToTeach || sending) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create skill exchange request
      const { error } = await supabase
        .from('skill_exchange_requests')
        .insert({
          requester_id: user.id,
          receiver_id: userId,
          skill_to_learn: requestForm.skillToLearn,
          skill_to_teach: requestForm.skillToTeach,
          message: requestForm.message,
          preferred_time: requestForm.preferredTime,
          location: requestForm.location,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: `Your skill exchange request has been sent to ${userName}`,
      });

      setShowRequestForm(false);
      setRequestForm({
        skillToLearn: '',
        skillToTeach: '',
        message: '',
        preferredTime: '',
        location: ''
      });
    } catch (error: any) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "Failed to send skill exchange request",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const teachingSkills = userSkills.filter(skill => skill.is_offering);
  const learningSkills = userSkills.filter(skill => skill.is_learning);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={userProfilePicture} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{userName}</CardTitle>
              <CardDescription>Skill Exchange Request</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!showRequestForm ? (
          <>
            {/* Skills Overview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Skills I Can Learn
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teachingSkills.length > 0 ? (
                    teachingSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No teaching skills available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-blue-500" />
                  Skills I Want to Learn
                </h4>
                <div className="flex flex-wrap gap-2">
                  {learningSkills.length > 0 ? (
                    learningSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No learning skills available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setShowRequestForm(true)}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800"
                disabled={teachingSkills.length === 0 || learningSkills.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Request Skill Exchange
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>

            {teachingSkills.length === 0 || learningSkills.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    {teachingSkills.length === 0 && learningSkills.length === 0 
                      ? "This user hasn't added any skills yet."
                      : teachingSkills.length === 0 
                        ? "This user hasn't added any teaching skills yet."
                        : "This user hasn't added any learning skills yet."
                    }
                  </p>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <motion.form 
            onSubmit={handleSendRequest}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skillToLearn">Skill I Want to Learn</Label>
                <select
                  id="skillToLearn"
                  value={requestForm.skillToLearn}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, skillToLearn: e.target.value }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a skill...</option>
                  {teachingSkills.map((skill, index) => (
                    <option key={index} value={skill.name}>{skill.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="skillToTeach">Skill I Can Teach</Label>
                <select
                  id="skillToTeach"
                  value={requestForm.skillToTeach}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, skillToTeach: e.target.value }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a skill...</option>
                  {learningSkills.map((skill, index) => (
                    <option key={index} value={skill.name}>{skill.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={requestForm.message}
                onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell them about your experience and what you're looking for..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input
                  id="preferredTime"
                  type="text"
                  value={requestForm.preferredTime}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                  placeholder="e.g., Weekends, Evenings"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={requestForm.location}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Online, San Francisco"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={!requestForm.skillToLearn || !requestForm.skillToTeach || sending}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {sending ? 'Sending...' : 'Send Request'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRequestForm(false)}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </CardContent>
    </Card>
  );
}
