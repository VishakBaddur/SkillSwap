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
  Flag, 
  UserX, 
  AlertTriangle, 
  Shield, 
  Send, 
  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface UserSafetyProps {
  userId: string;
  userName: string;
  userProfilePicture?: string;
  onClose: () => void;
}

const reportReasons = [
  { id: 'spam', label: 'Spam or fake profile', description: 'This user is sending spam or has a fake profile' },
  { id: 'harassment', label: 'Harassment or bullying', description: 'This user is being harassing or bullying others' },
  { id: 'inappropriate', label: 'Inappropriate content', description: 'This user is sharing inappropriate content' },
  { id: 'scam', label: 'Scam or fraud', description: 'This user is trying to scam or defraud others' },
  { id: 'fake_skills', label: 'Fake skills or qualifications', description: 'This user is claiming skills they don\'t have' },
  { id: 'other', label: 'Other', description: 'Something else that violates our community guidelines' }
];

export function UserSafety({ userId, userName, userProfilePicture, onClose }: UserSafetyProps) {
  const [activeTab, setActiveTab] = useState<'report' | 'block'>('report');
  const [reportForm, setReportForm] = useState({
    reason: '',
    details: '',
    evidence: ''
  });
  const [blockForm, setBlockForm] = useState({
    reason: '',
    confirmBlock: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.reason || submitting) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create user report
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: userId,
          reason: reportForm.reason,
          details: reportForm.details,
          evidence: reportForm.evidence,
          status: 'pending'
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this user. We'll review it within 24 hours.",
      });
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!blockForm.confirmBlock || submitting) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create user block
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_user_id: userId,
          reason: blockForm.reason,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "User Blocked",
        description: `You have blocked ${userName}. They won't be able to contact you.`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
            <p className="text-gray-600 mb-6">
              Thank you for helping keep our community safe. We'll review your report within 24 hours.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

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
              <CardTitle className="text-xl">Safety & Reporting</CardTitle>
              <CardDescription>Report or block {userName}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'report'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Flag className="w-4 h-4 inline mr-2" />
            Report User
          </button>
          <button
            onClick={() => setActiveTab('block')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'block'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserX className="w-4 h-4 inline mr-2" />
            Block User
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'report' ? (
            <motion.form
              key="report"
              onSubmit={handleReportSubmit}
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Why are you reporting this user?
                </Label>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <label
                      key={reason.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.id}
                        checked={reportForm.reason === reason.id}
                        onChange={(e) => setReportForm(prev => ({ ...prev, reason: e.target.value }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm">{reason.label}</div>
                        <div className="text-gray-600 text-xs">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="details">Additional Details (Optional)</Label>
                <Textarea
                  id="details"
                  value={reportForm.details}
                  onChange={(e) => setReportForm(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Please provide any additional information that might help us investigate..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="evidence">Evidence (Optional)</Label>
                <Input
                  id="evidence"
                  value={reportForm.evidence}
                  onChange={(e) => setReportForm(prev => ({ ...prev, evidence: e.target.value }))}
                  placeholder="Links to screenshots, messages, or other evidence"
                  className="mt-1"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">Your report is confidential</h4>
                    <p className="text-blue-800 text-xs mt-1">
                      The reported user will not know who reported them. We take all reports seriously and investigate them thoroughly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={!reportForm.reason || submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Flag className="w-4 h-4 mr-2" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="block"
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 text-sm">Blocking a user</h4>
                    <p className="text-red-800 text-xs mt-1">
                      When you block {userName}, they won't be able to:
                    </p>
                    <ul className="text-red-800 text-xs mt-2 list-disc list-inside space-y-1">
                      <li>Send you messages</li>
                      <li>Send you skill exchange requests</li>
                      <li>See your profile in search results</li>
                      <li>Contact you in any way</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="blockReason">Reason for blocking (Optional)</Label>
                <Textarea
                  id="blockReason"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Why are you blocking this user?"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="confirmBlock"
                  checked={blockForm.confirmBlock}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, confirmBlock: e.target.checked }))}
                  className="mt-1"
                />
                <label htmlFor="confirmBlock" className="text-sm text-gray-700">
                  I understand that blocking this user will prevent all future contact and I can unblock them later if needed.
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBlockUser}
                  disabled={!blockForm.confirmBlock || submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserX className="w-4 h-4 mr-2" />
                  )}
                  {submitting ? 'Blocking...' : 'Block User'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
