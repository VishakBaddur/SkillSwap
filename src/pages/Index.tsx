import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, BookOpen, MessageCircle, Star, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AnimatedBackground } from '@/components/ui/animated-background';

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
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

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
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">
            SkillSwap
          </span>
        </motion.div>
        <div className="flex items-center space-x-3">
          <Link to="/auth">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 border-white/20">
              Sign In
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="!bg-white !text-black hover:!bg-white/90 font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center relative z-10 min-h-[80vh] flex items-center"
        variants={containerVariants}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-2" />
              Now Available on App Store & Google Play
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
            variants={itemVariants}
          >
            Trade Skills, Not Money
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Connect with people who can teach you what you want to learn, and share your expertise in return. 
            Build meaningful relationships through skill exchange.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link to="/auth">
              <Button size="lg" className="text-base px-8 py-6 !bg-white !text-black hover:!bg-white/90">
                Start Trading Skills
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-base px-8 py-6 !border-white/30 !text-white hover:!bg-white/10 bg-transparent">
              <Link to="/demo">Watch Demo</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            How It Works
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            SkillSwap makes it easy to find the perfect skill exchange partner
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Users,
              title: "Find Your Match",
              description: "Browse through thousands of users offering skills you want to learn",
              content: "Our intelligent matching algorithm connects you with people who have the skills you need and want to learn what you can teach."
            },
            {
              icon: MessageCircle,
              title: "Connect & Chat",
              description: "Start conversations and arrange skill exchange sessions",
              content: "Built-in messaging features make it easy to coordinate your skill exchange sessions and build lasting connections."
            },
            {
              icon: Star,
              title: "Learn & Grow",
              description: "Track your progress and build a portfolio of new skills",
              content: "Keep track of your learning journey, earn badges for completed exchanges, and showcase your growing skill set."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Card className="glass-card h-full hover:bg-white/10 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4 border border-white/20">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60 leading-relaxed text-sm">
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
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
      >
        <motion.div 
          className="glass-card rounded-2xl p-12 sm:p-16 text-center"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-white">
            Join Our Growing Community
          </h2>
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { number: "50K+", label: "Active Users", icon: Users },
              { number: "200+", label: "Skills Available", icon: BookOpen },
              { number: "10K+", label: "Successful Exchanges", icon: Award }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-5xl sm:text-6xl font-bold mb-3 text-white">
                  {stat.number}
                </div>
                <div className="text-white/70 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        ref={ctaRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
      >
        <div className="max-w-3xl mx-auto">
          <motion.h2 
            className="text-4xl sm:text-5xl font-bold mb-6 text-white"
            variants={itemVariants}
          >
            Ready to Start Your Skill Journey?
          </motion.h2>
          <motion.p 
            className="text-lg text-white/70 mb-10 leading-relaxed"
            variants={itemVariants}
          >
            Join thousands of learners and teachers who are already trading skills on SkillSwap
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link to="/auth">
              <Button size="lg" className="text-base px-10 py-6 !bg-white !text-black hover:!bg-white/90">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="border-t border-white/10 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid md:grid-cols-4 gap-8 sm:gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">SkillSwap</span>
              </div>
              <p className="text-white/60 leading-relaxed text-sm">
                The platform for meaningful skill exchanges and community learning.
              </p>
            </div>
            {[
              { title: "Product", items: ["Features", "Pricing", "Download", "API"] },
              { title: "Company", items: ["About", "Blog", "Careers", "Contact"] },
              { title: "Support", items: ["Help Center", "Privacy Policy", "Terms of Service", "Community Guidelines"] }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4 text-white text-sm">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li 
                      key={itemIndex}
                      className="text-white/60 hover:text-white cursor-pointer transition-colors text-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60 text-sm">
            <p>&copy; 2024 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
