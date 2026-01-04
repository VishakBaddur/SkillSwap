import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to SkillSwap!",
    description: "The platform where you trade skills, not money",
    content: (
      <div className="text-center space-y-6">
        <motion.div
          className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-700 rounded-3xl flex items-center justify-center mx-auto shadow-xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <BookOpen className="w-10 h-10 text-white" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to start your skill journey?
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            Connect with amazing people who can teach you what you want to learn, 
            and share your expertise in return. Let's get you started!
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "How It Works",
    description: "Three simple steps to skill exchange success",
    content: (
      <div className="space-y-6">
        {[
          {
            icon: Users,
            title: "Find Your Match",
            description: "Browse users and find someone who can teach what you want to learn",
            color: "from-gray-400 to-gray-600"
          },
          {
            icon: MessageCircle,
            title: "Connect & Chat",
            description: "Start a conversation and arrange your skill exchange session",
            color: "from-gray-500 to-gray-700"
          },
          {
            icon: Star,
            title: "Learn & Grow",
            description: "Complete your skill exchange and build lasting connections",
            color: "from-green-500 to-emerald-500"
          }
        ].map((step, index) => (
          <motion.div
            key={index}
            className="flex items-start space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <step.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">{step.title}</h4>
              <p className="text-gray-300 text-sm">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: 3,
    title: "Build Your Profile",
    description: "Add your skills to get started",
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            What skills can you offer?
          </h3>
          <p className="text-gray-300 mb-6">
            Add skills you can teach others. This helps people find you!
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {['JavaScript', 'Python', 'Cooking', 'Photography', 'Spanish', 'Guitar'].map((skill, index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Badge 
                variant="secondary" 
                className="w-full justify-center py-2 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {skill}
              </Badge>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Don't worry, you can add more skills later in your profile!
          </p>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "You're All Set!",
    description: "Ready to start trading skills",
    content: (
      <div className="text-center space-y-6">
        <motion.div
          className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Welcome to the SkillSwap community!
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            You're now ready to discover amazing people, learn new skills, 
            and share your expertise. Let's make learning fun and social!
          </p>
        </div>
        
        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <Sparkles className="w-4 h-4 mr-2" />
            Pro Tip: Complete your profile to get better matches!
          </Badge>
        </div>
      </div>
    )
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
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

      <motion.div 
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                    index <= currentStep ? 'bg-gray-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <CardTitle className="text-2xl text-white mb-2">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Get Started!
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
