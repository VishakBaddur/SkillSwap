import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, BookOpen, MessageCircle, Star, Sparkles, Zap, Heart, Globe, Shield, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Index() {
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.3, triggerOnce: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
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

      {/* Navigation */}
      <motion.nav 
        className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SkillSwap
          </span>
        </motion.div>
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                Sign In
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="container mx-auto px-4 py-20 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="mb-8 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              🚀 Now Available on App Store & Google Play
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight"
            variants={itemVariants}
          >
            Trade Skills, Not Money
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Connect with people who can teach you what you want to learn, and share your expertise in return. 
            Build meaningful relationships through skill exchange.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl">
                  Start Trading Skills
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-white/30 text-white hover:bg-white/10">
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        className="container mx-auto px-4 py-32 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
      >
        <motion.div className="text-center mb-20" variants={itemVariants}>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            SkillSwap makes it easy to find the perfect skill exchange partner
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              icon: Users,
              title: "Find Your Match",
              description: "Browse through thousands of users offering skills you want to learn",
              content: "Our intelligent matching algorithm connects you with people who have the skills you need and want to learn what you can teach.",
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-500/20 to-cyan-500/20"
            },
            {
              icon: MessageCircle,
              title: "Connect & Chat",
              description: "Start conversations and arrange skill exchange sessions",
              content: "Built-in messaging and video calling features make it easy to coordinate your skill exchange sessions and build lasting connections.",
              color: "from-purple-500 to-pink-500",
              bgColor: "from-purple-500/20 to-pink-500/20"
            },
            {
              icon: Star,
              title: "Learn & Grow",
              description: "Track your progress and build a portfolio of new skills",
              content: "Keep track of your learning journey, earn badges for completed exchanges, and showcase your growing skill set to the community.",
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-500/20 to-emerald-500/20"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl h-full">
                <CardHeader>
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                  </motion.div>
                  <CardTitle className="text-2xl text-white mb-3">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        className="container mx-auto px-4 py-32 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
      >
        <motion.div 
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-16 text-white text-center backdrop-blur-xl border border-white/10 shadow-2xl"
          variants={itemVariants}
        >
          <h2 className="text-5xl font-bold mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Join Our Growing Community
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { number: "50K+", label: "Active Users", icon: Users },
              { number: "200+", label: "Skills Available", icon: BookOpen },
              { number: "10K+", label: "Successful Exchanges", icon: Award }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-purple-200 text-xl">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        ref={ctaRef}
        className="container mx-auto px-4 py-32 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Ready to Start Your Skill Journey?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-12 leading-relaxed"
            variants={itemVariants}
          >
            Join thousands of learners and teachers who are already trading skills on SkillSwap
          </motion.p>
          <motion.div variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="bg-black/20 backdrop-blur-xl border-t border-white/10 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <motion.div 
                className="flex items-center space-x-3 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">SkillSwap</span>
              </motion.div>
              <p className="text-gray-400 leading-relaxed">
                The platform for meaningful skill exchanges and community learning.
              </p>
            </div>
            {[
              { title: "Product", items: ["Features", "Pricing", "Download", "API"] },
              { title: "Company", items: ["About", "Blog", "Careers", "Contact"] },
              { title: "Support", items: ["Help Center", "Privacy Policy", "Terms of Service", "Community Guidelines"] }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-6 text-white text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <motion.li 
                      key={itemIndex}
                      className="text-gray-400 hover:text-white cursor-pointer transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
} 