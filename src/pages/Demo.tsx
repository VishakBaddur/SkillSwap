import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Users, MessageCircle, Video, Star, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';
export default function Demo() {

  const demoSteps = [
    {
      title: "Sign Up & Create Your Profile",
      description: "Join SkillSwap in seconds. Add your skills - what you can teach and what you want to learn.",
      icon: Users,
      features: [
        "Quick signup with email",
        "Add multiple skills",
        "Set your location",
        "Upload profile picture"
      ]
    },
    {
      title: "Discover Perfect Matches",
      description: "Our AI-powered matching algorithm finds people who complement your skills perfectly.",
      icon: Sparkles,
      features: [
        "Smart skill matching",
        "Location-based suggestions",
        "Match quality scores",
        "See mutual interests"
      ]
    },
    {
      title: "Chat & Connect",
      description: "Start conversations with your matches. Exchange ideas and plan your skill swap.",
      icon: MessageCircle,
      features: [
        "Real-time messaging",
        "Instant notifications",
        "Message history",
        "Safe communication"
      ]
    },
    {
      title: "Video Call & Learn",
      description: "Once matched, start video calls to learn from each other. See, hear, and learn together.",
      icon: Video,
      features: [
        "HD video calls",
        "Screen sharing ready",
        "Mute/unmute controls",
        "Secure connections"
      ]
    },
    {
      title: "Exchange Skills",
      description: "Create skill exchange requests. Teach what you know, learn what you need.",
      icon: Star,
      features: [
        "Request skill exchanges",
        "Schedule sessions",
        "Track progress",
        "Rate your experience"
      ]
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Navigation */}
      <motion.nav 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-10 border-b border-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <Button variant="ghost" className="!text-white/80 hover:!text-white hover:!bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
            <Play className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">
            SkillSwap Demo
          </span>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            How SkillSwap Works
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Watch how easy it is to trade skills and learn from amazing people in your community
          </p>
        </motion.div>

        {/* Demo Steps */}
        <div className="max-w-4xl mx-auto space-y-8">
          {demoSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-semibold text-white/50">
                          Step {index + 1}
                        </span>
                        <CardTitle className="text-2xl text-white">
                          {step.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-white/70 text-lg">
                        {step.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Start Trading Skills?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already learning and teaching skills for free
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="!bg-white !text-black hover:!bg-white/90 font-medium">
                Get Started Free
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="!border-white/20 !text-white hover:!bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Video Placeholder */}
        <motion.div
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-8">
              <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <p className="text-white/70 mb-2">Demo Video Coming Soon</p>
                  <p className="text-sm text-white/50">
                    Record your screen walkthrough or use AI tools like Loom, Synthesia, or D-ID
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

