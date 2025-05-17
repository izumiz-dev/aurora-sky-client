> **NOTE**: This application is currently in testing. You may encounter unexpected behavior or issues.

# AuroraSky - A Beautiful Bluesky Client

![AuroraSky](https://img.shields.io/badge/AuroraSky-Bluesky%20Client-1185fe)
![Preact](https://img.shields.io/badge/Preact-10.x-673ab8)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06b6d4)

AuroraSky is a modern, beautiful, and performant client for [Bluesky](https://bsky.social) built with Preact and Vite. It features both modern and traditional UI designs, rich content rendering, and full support for the AT Protocol.

## ✨ Features

- 🎨 **Dual Theme Support**: Choose between modern glassmorphism UI or traditional design
- 📱 **Responsive Design**: Optimized for desktop and mobile experiences
- 🖼️ **Rich Content Support**: 
  - Image galleries with lightbox viewer
  - YouTube embeds
  - URL previews
  - Quoted posts
- 🚀 **Performance Optimized**: Built with Preact for minimal bundle size
- 🔐 **Secure Authentication**: Using official @atproto/api
- 🌏 **Internationalization Ready**: Language preference support
- ⚡ **Fast Development**: Hot module replacement with Vite

## 🛠️ Tech Stack

- **Frontend Framework**: [Preact](https://preactjs.com/) (React-compatible)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: preact-router
- **State Management**: @tanstack/react-query & @preact/signals
- **Authentication**: @atproto/api
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript (strict mode)
- **Package Manager**: npm (managed by Volta)

## 🚀 Getting Started

### Prerequisites

- Node.js 22.15.1 or higher
- npm 11.4.0 or higher

> Tip: Use [Volta](https://volta.sh/) for automatic Node.js version management

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bsky-client.git
cd bsky-client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open automatically at [http://localhost:3000](http://localhost:3000).

## 📝 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
src/
├── app.css              # Global styles
├── app.tsx              # Main app component with routing
├── components/          # Reusable UI components
│   ├── PostComposer.tsx
│   ├── PostItem.tsx
│   └── content/         # Content rendering components
├── context/             # React contexts
│   ├── AuthContext.tsx  # Authentication provider
│   └── LanguagePreferences.tsx
├── hooks/               # Custom React hooks
├── layouts/             # Layout components
│   ├── MainLayout.tsx   # Traditional layout
│   └── ModernLayout.tsx # Modern glassmorphism layout
├── lib/                 # Core libraries
│   └── api.ts          # Bluesky API wrapper
├── pages/              # Route components
├── services/           # Business logic
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔑 Key Features

### Authentication
- Secure login with Bluesky credentials
- Session persistence in localStorage
- Automatic session resume on app reload

### Timeline & Posts
- Infinite scroll timeline
- Rich text rendering with facets (mentions, links, hashtags)
- Image galleries with lightbox viewer
- Embedded content (YouTube, quoted posts, URL previews)
- Post composer with image uploads

### UI/UX
- Modern glassmorphism design option
- Traditional interface option
- Responsive layout for all screen sizes
- Loading states and error handling
- Toast notifications for user feedback

## 🔧 Development

### Code Style

This project uses:
- ESLint for linting
- Prettier for code formatting
- TypeScript in strict mode

### API Integration

All Bluesky API calls are wrapped in `src/lib/api.ts` for consistent error handling and session management.

### State Management

- React Query for server state (timeline, posts)
- Preact Signals for reactive client state
- Context API for authentication state

## 🔐 Security

### Security Features

- **Session Encryption**: All session data is encrypted using Web Crypto API
- **Content Security Policy**: Strict CSP headers to prevent XSS attacks
- **Input Validation**: Comprehensive validation for all user inputs
- **HTTPS Only**: Automatic redirect to HTTPS in production
- **Secure Headers**: X-Frame-Options, X-Content-Type-Options, etc.

### Best Practices

1. **Environment Variables**: Use `.env.example` as a template
2. **Session Keys**: Generate secure random keys for production
3. **Regular Updates**: Run `npm audit` regularly
4. **Security Documentation**: See [docs/SECURITY.md](docs/SECURITY.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with the [AT Protocol](https://atproto.com/)
- Inspired by the Bluesky community
- UI components from [Headless UI](https://headlessui.com/) and [Heroicons](https://heroicons.com/)

---

Made with ❤️ by the AuroraSky team