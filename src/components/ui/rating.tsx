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
  Star, 
  Send, 
  X, 
  CheckCircle,
  ThumbsUp,
  MessageCircle,
  Clock,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface RatingProps {
  userId: string;
  userName: string;
  userProfilePicture?: string;
  skillExchanged: string;
  onClose: () => void;
}

const ratingCategories = [
  { id: 'communication', label: 'Communication', description: 'How well did they communicate?' },
  { id: 'teaching_ability', label: 'Teaching Ability', description: 'How good were they at teaching?' },
  { id: 'punctuality', label: 'Punctuality', description: 'Were they on time and reliable?' },
  { id: 'friendliness', label: 'Friendliness', description: 'How friendly and approachable were they?' },
  { id: 'knowledge', label: 'Knowledge', description: 'How knowledgeable were they about the skill?' }
];

export function Rating({ userId, userName, userProfilePicture, skillExchanged, onClose }: RatingProps) {
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleCategoryRating = (categoryId: string, value: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || submitting) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create rating
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          rater_id: user.id,
          rated_user_id: userId,
          skill_exchanged: skillExchanged,
          overall_rating: rating,
          communication_rating: categoryRatings.communication || 0,
          teaching_ability_rating: categoryRatings.teaching_ability || 0,
          punctuality_rating: categoryRatings.punctuality || 0,
          friendliness_rating: categoryRatings.friendliness || 0,
          knowledge_rating: categoryRatings.knowledge || 0,
          review_text: review,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Rating Submitted!",
        description: "Thank you for your feedback. It helps our community grow.",
      });
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
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
            <h3 className="text-xl font-semibold mb-2">Rating Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for your feedback. Your rating helps other users make informed decisions.
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
              <CardTitle className="text-xl">Rate Your Experience</CardTitle>
              <CardDescription>How was your skill exchange with {userName}?</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Overall Rating *
            </Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {rating === 0 ? 'Select a rating' : 
                 rating === 1 ? 'Poor' :
                 rating === 2 ? 'Fair' :
                 rating === 3 ? 'Good' :
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </span>
            </div>
          </div>

          {/* Category Ratings */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Rate Specific Areas (Optional)
            </Label>
            <div className="space-y-4">
              {ratingCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">{category.label}</Label>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => handleCategoryRating(category.id, star)}
                        className="focus:outline-none"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (categoryRatings[category.id] || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                    <span className="ml-2 text-xs text-gray-500">
                      {categoryRatings[category.id] || 0}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review">Write a Review (Optional)</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this skill exchange. What went well? What could be improved?"
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your review will be visible to other users and helps build trust in our community.
            </p>
          </div>

          {/* Skill Exchanged Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Skill Exchanged</h4>
                <p className="text-blue-800 text-sm">{skillExchanged}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={rating === 0 || submitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Component to display user ratings
interface UserRatingsProps {
  userId: string;
}

export function UserRatings({ userId }: UserRatingsProps) {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [userId]);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select(`
          *,
          rater:users!user_ratings_rater_id_fkey(name, profile_picture)
        `)
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No ratings yet</h3>
        <p className="text-gray-600">This user hasn't received any ratings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <Card key={rating.id} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={rating.rater?.profile_picture} />
                <AvatarFallback>{rating.rater?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-sm">{rating.rater?.name}</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating.overall_rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {rating.skill_exchanged}
                  </Badge>
                </div>
                {rating.review_text && (
                  <p className="text-gray-700 text-sm mb-2">{rating.review_text}</p>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(rating.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
