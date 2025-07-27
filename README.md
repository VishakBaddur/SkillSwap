# SkillSwap - Trade Skills, Not Money

A modern skill exchange platform where users can trade skills instead of money. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Skill Exchange**: Find people who can teach you what you want to learn
- **User Profiles**: Showcase your skills and what you want to learn
- **Smart Matching**: Intelligent algorithm to find the perfect skill exchange partners
- **Real-time Chat**: Built-in messaging system for coordinating exchanges
- **PWA Ready**: Install as a native app on mobile devices
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Beautiful gradients and glass-morphism effects

## 📱 App Store Ready

This application is optimized for deployment to:
- **App Store (iOS)** - Using PWA capabilities
- **Google Play Store** - Using PWA capabilities
- **Web** - Progressive Web App with native app-like experience

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillswap.git
   cd skillswap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Update the Supabase URL and key in `src/lib/supabase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Schema

The application uses the following Supabase tables:

### Users Table
```sql
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT auth.uid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT,
  bio TEXT,
  profile_picture TEXT,
  email TEXT NOT NULL
);
```

### Skills Table
```sql
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL UNIQUE,
  category TEXT
);
```

### User Skills Junction Table
```sql
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES public.users(id),
  skill_id UUID REFERENCES public.skills(id),
  is_offering BOOLEAN DEFAULT false,
  is_learning BOOLEAN DEFAULT false,
  proficiency_level TEXT
);
```

### Matches Table
```sql
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id),
  user2_id UUID REFERENCES public.users(id),
  matched_on TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending'
);
```

## 📱 PWA Features

### App Store Deployment
The application is configured as a Progressive Web App (PWA) which allows it to be installed on mobile devices like a native app.

**For iOS App Store:**
- Uses PWA capabilities
- Includes Apple touch icons
- Configured with proper meta tags
- Supports offline functionality

**For Google Play Store:**
- Uses PWA capabilities  
- Includes Android icons
- Configured with proper manifest
- Supports offline functionality

### PWA Configuration
- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Icons**: Multiple sizes for different devices
- **Offline Support**: Caches essential resources

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Deploy to Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Initialize Firebase: `firebase init`
3. Build and deploy: `npm run build && firebase deploy`

## 📱 App Store Submission

### iOS App Store
1. Build the PWA: `npm run build`
2. Use tools like [PWA Builder](https://www.pwabuilder.com/) to generate iOS app
3. Submit to App Store Connect

### Google Play Store
1. Build the PWA: `npm run build`
2. Use tools like [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) to generate Android app
3. Submit to Google Play Console

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration
Update `src/lib/supabase.ts` with your Supabase credentials:

```typescript
const supabaseUrl = 'your_supabase_url';
const supabaseAnonKey = 'your_supabase_anon_key';
```

## 📁 Project Structure

```
src/
├── components/
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── pages/           # Page components
└── main.tsx         # Application entry point
```

## 🎨 Customization

### Colors
Update the color scheme in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ... other colors
}
```

### Styling
The application uses Tailwind CSS with a custom design system. Update styles in:
- `src/index.css` - CSS variables and base styles
- `tailwind.config.ts` - Tailwind configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@skillswap.app or create an issue in this repository.

## 🔮 Roadmap

- [ ] Real-time messaging
- [ ] Video calling integration
- [ ] Skill verification system
- [ ] Rating and review system
- [ ] Advanced matching algorithm
- [ ] Mobile app development
- [ ] Payment integration (optional premium features)

---

Made with ❤️ by the SkillSwap Team 