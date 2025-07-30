# 🚀 SkillSwap - Trade Skills, Not Money

A modern skill exchange platform where users can connect and trade skills instead of money. Built with React, TypeScript, and Supabase.

## 🌟 Live Demo

**Visit the live application:** [https://skill-swap-lovat.vercel.app](https://skill-swap-lovat.vercel.app)

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Authentication**: Email/password signup and login
- **Password Reset**: Forgot password functionality with email links
- **User Profiles**: Complete profile setup with bio, location, and contact info
- **Session Management**: Persistent login sessions

### 🎯 Skill Management
- **Add Teaching Skills**: Skills you can offer to others
- **Add Learning Skills**: Skills you want to learn from others
- **Skill Categories**: Technology, Languages, Music, Art, Sports, Cooking, Business
- **Custom Skills**: Add your own unique skills
- **In-place Editing**: Edit skills directly from your profile

### 🔍 Discovery & Matching
- **Smart Search**: Search by name or skill
- **Category Filtering**: Filter users by skill categories
- **Real-time Matching**: Find users who can teach what you want to learn
- **Contact Integration**: Direct email and phone contact options

### 📱 Mobile-First Design
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Responsive Design**: Works perfectly on all screen sizes
- **Touch-Optimized**: 44px minimum touch targets for accessibility
- **Bottom Navigation**: Mobile-friendly navigation bar

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful glass-like interface
- **Smooth Animations**: Fade-in and slide-up animations
- **Loading States**: Skeleton loaders and spinners
- **Toast Notifications**: User-friendly feedback system

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Secure data access
- **Real-time Subscriptions** - Live data updates

### Deployment & Hosting
- **Vercel** - Frontend hosting and deployment
- **GitHub** - Version control and CI/CD
- **PWA Support** - Service worker and manifest

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VishakBaddur/SkillSwap.git
   cd SkillSwap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT,
  bio TEXT,
  email TEXT NOT NULL,
  profile_picture TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Skills Table
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### User Skills Junction Table
```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  skill_id UUID REFERENCES skills(id),
  is_offering BOOLEAN DEFAULT false,
  is_learning BOOLEAN DEFAULT false,
  proficiency_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🎯 Key Features Implementation

### Authentication Flow
- Supabase Auth integration
- Protected routes with React Router
- Automatic session management
- Password reset functionality

### Real-time Data
- Live user matching
- Instant skill updates
- Real-time notifications

### Mobile Optimization
- PWA manifest and service worker
- Touch-friendly interface
- Responsive design patterns
- Bottom navigation for mobile

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Supabase Setup
1. Create a new Supabase project
2. Run the database schema scripts
3. Configure authentication settings
4. Set up email templates

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Full-screen mode and native feel
- **Push Notifications**: Ready for future implementation

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
```

### Project Structure
```
src/
├── components/      # Reusable UI components
│   └── ui/         # shadcn/ui components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── integrations/   # External service integrations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vishak Baddur Sadanand**
- GitHub: [@VishakBaddur](https://github.com/VishakBaddur)
- LinkedIn: [Your LinkedIn]
- Portfolio: [Your Portfolio]

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Vercel](https://vercel.com) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for styling

---

⭐ **Star this repository if you found it helpful!** 