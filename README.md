> **NOTE**: This application is currently in testing. You may encounter unexpected behavior or issues.

# Aurora Sky - A Beautiful Bluesky Client

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aurora.izumiz.dev-1185fe)](https://aurora.izumiz.dev)
![Preact](https://img.shields.io/badge/Preact-10.x-673ab8)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06b6d4)

Aurora Sky is a modern, beautiful, and performant client for [Bluesky](https://bsky.social) built with Preact and Vite. It features both modern glassmorphism and traditional UI designs, rich content rendering, and full support for the AT Protocol.

## ✨ Features

- 🎨 **Multiple Theme Support**: 
  - Modern glassmorphism UI with particle effects
  - Traditional clean interface
  - Custom Aurora loader animations
- 📱 **Responsive Design**: Optimized for desktop and mobile experiences
- 🖼️ **Rich Content Support**: 
  - Image galleries with lightbox viewer
  - YouTube embeds
  - URL previews
  - Quoted posts
  - Thread view with optimized self-thread display
  - AI-powered alt text generation for images
- 🚀 **Performance Optimized**: 
  - Built with Preact for minimal bundle size
  - Lazy loading and code splitting
  - Service Worker for offline support
- 🔐 **Enhanced Security**: 
  - Session encryption with Web Crypto API
  - Strict Content Security Policy
  - Secure authentication using official @atproto/api
- 🌏 **Internationalization Ready**: Language preference support
- ⚡ **Fast Development**: Hot module replacement with Vite
- 📊 **Error Tracking**: Optional Sentry integration for production monitoring

## 🛠️ Tech Stack

- **Frontend Framework**: [Preact](https://preactjs.com/) 10.26.5 (React-compatible)
- **Build Tool**: [Vite](https://vitejs.dev/) 6.3.5
- **Routing**: preact-router 4.1.2
- **State Management**: 
  - @tanstack/react-query 5.76.1 for server state
  - @preact/signals 2.0.4 for reactive client state
- **Authentication**: @atproto/api 0.15.7
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1.7
- **Language**: TypeScript 5.8.3 (strict mode)
- **Package Manager**: npm 11.4.0 (managed by Volta)
- **UI Components**: 
  - @headlessui/react 2.2.3
  - @heroicons/react 2.2.0
  - lucide-react 0.511.0

## 🚀 Getting Started

### Prerequisites

- Node.js 22.15.1 or higher
- npm 11.4.0 or higher

> Tip: Use [Volta](https://volta.sh/) for automatic Node.js version management (already configured in package.json)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/izumiz-dev/aurora-sky-client.git
cd aurora-sky-client
```

2. Copy the environment configuration:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Generate a secure `VITE_SESSION_KEY` for production
   - Optionally configure `VITE_SENTRY_DSN` for error tracking

4. Install dependencies:
```bash
npm install
```

5. Start the development server:
```bash
npm run dev
```

The app will open automatically at [http://localhost:3000](http://localhost:3000).

## 📝 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (includes PWA icon generation)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run generate-icons` - Generate PWA icons (automatically run during build)

## 📁 Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Reusable UI components
│   ├── AppIcon.tsx
│   ├── AuroraLoader.tsx
│   ├── BackgroundParticles.tsx
│   ├── CachedAvatar.tsx
│   ├── ContextMenu.tsx
│   ├── FloatingSettings.tsx
│   ├── PostComposer.tsx
│   ├── PostItem.tsx
│   ├── ThreadView.tsx
│   ├── content/         # Content rendering components
│   └── thread/          # Thread-related components
├── context/             # React contexts
│   ├── AuthContext.tsx  # Authentication provider
│   └── LanguagePreferences.tsx
├── hooks/               # Custom React hooks
├── layouts/             # Layout components
│   ├── MainLayout.tsx   # Traditional layout
│   └── ModernLayout.tsx # Modern glassmorphism layout
├── lib/                 # Core libraries
│   ├── api.ts          # Bluesky API wrapper
│   ├── sentry.optional.ts # Sentry integration
│   └── sw-register.ts  # Service Worker registration
├── pages/              # Route components
├── services/           # Business logic
├── styles/             # Additional CSS files
│   ├── header-fix.css
│   └── modal.css
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── app.tsx             # Main app component with routing
├── glass.css           # Glassmorphism styles
├── index.css           # Global styles
├── main.tsx            # Application entry point
└── modern.css          # Modern theme styles
```

## 🔑 Key Features

### Authentication
- Secure login with Bluesky credentials
- Session persistence with encryption
- Automatic session resume on app reload
- Support for multiple Bluesky instances

### Timeline & Posts
- Infinite scroll timeline with optimized loading
- Rich text rendering with facets (mentions, links, hashtags)
- Image galleries with lightbox viewer
- Embedded content (YouTube, quoted posts, URL previews)
- Advanced post composer with:
  - Image uploads with alt text
  - AI-powered alt text generation using Google Gemini
  - Rich text support
  - Draft saving
  - Mobile-optimized full-screen composer

### UI/UX
- Modern glassmorphism design with animated particles
- Traditional clean interface option
- Responsive layout for all screen sizes
- Custom Aurora loading animations
- Context menus for post actions
- Floating settings panel
- Snackbar notifications for user feedback
- PWA support with offline capabilities
- Enhanced mobile performance with optimized animations
- Accessible alt text indicators for images

### Performance
- Service Worker for offline functionality with CSP-compliant caching
- Image caching with CachedAvatar component
- Optimized thread rendering for self-threads
- Code splitting for faster initial load
- Progressive Web App (PWA) capabilities
- Mobile-specific performance optimizations
- Efficient image metadata removal and resizing

## 🔧 Development

### Code Style

This project uses:
- ESLint with TypeScript support for linting
- Prettier for code formatting
- TypeScript in strict mode
- Import path aliasing (@/ for src/)

### API Integration

All Bluesky API calls are wrapped in `src/lib/api.ts` for consistent error handling and session management.

### State Management

- React Query for server state (timeline, posts, user data)
- Preact Signals for reactive client state
- Context API for authentication and language preferences

### Security Headers

Development and production servers include security headers:
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy

## 🔐 Security

### Security Features

- **Session Encryption**: All session data is encrypted using Web Crypto API
- **Content Security Policy**: Strict CSP headers to prevent XSS attacks
- **Input Validation**: Comprehensive validation for all user inputs
- **HTTPS Enforcement**: Automatic redirect to HTTPS in production
- **Secure Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Service Worker Security**: Secure offline functionality

### Best Practices

1. **Environment Variables**: Use `.env.example` as a template
2. **Session Keys**: Generate secure random keys for production (32+ characters)
3. **Regular Updates**: Run `npm audit` regularly
4. **Security Documentation**: See [docs/SECURITY.md](docs/SECURITY.md) and [docs/SECURITY_BEST_PRACTICES.md](docs/SECURITY_BEST_PRACTICES.md)

## 🌐 Deployment

### Production Build

1. Set production environment variables
2. Run `npm run build`
3. Deploy the `dist` folder to your hosting provider

### Recommended Hosting

- Vercel
- Netlify
- Cloudflare Pages

All support automatic deployments and provide necessary security headers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all linting and type checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Alternative License

An alternative license is also available for specific use cases. See [LICENSE-ALTERNATIVE.md](LICENSE-ALTERNATIVE.md) for more information.

### Disclaimer

This software is provided "as is". See [DISCLAIMER.md](DISCLAIMER.md) for more information.

## 🙏 Acknowledgments

- Built with the [AT Protocol](https://atproto.com/)
- Inspired by the Bluesky community
- UI components from [Headless UI](https://headlessui.com/) and [Heroicons](https://heroicons.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📚 Documentation

- [Security Guidelines](docs/SECURITY.md)
- [Security Best Practices](docs/SECURITY_BEST_PRACTICES.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Gemini API Setup](docs/GEMINI_SETUP.md)
- [Claude AI Integration Notes](CLAUDE.md)

---

Made with ❤️ by [@izumiz-dev](https://github.com/izumiz-dev)
