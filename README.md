# 🛡️ Code Sentinel

  An intelligent AI-powered GitHub repository security analyzer that
  provides comprehensive pull request analysis, risk assessment, and
  real-time security monitoring.

  ## ✨ Features

  ### 🔍 Repository Analysis
  - **GitHub Integration**: Seamlessly analyze any public GitHub
  repository
  - **Pull Request Analysis**: Deep dive into PR changes with
  AI-powered insights
  - **Risk Assessment**: Automated security risk scoring for each pull
   request
  - **Security Scanning**: Comprehensive security vulnerability
  detection

  ### 🤖 AI-Powered Intelligence
  - **Claude AI Integration**: Advanced code analysis using
  Anthropic's Claude
  - **RAG Chatbot**: Context-aware repository-specific question
  answering
  - **Semantic Analysis**: Code similarity and pattern detection
  - **Smart Recommendations**: Actionable security and code quality
  suggestions

  ### 📊 Dashboard Features
  - **Real-time Monitoring**: Live updates on repository security
  status
  - **Analysis History**: Track analyzed repositories and maintain
  history
  - **Interactive UI**: Modern, responsive interface built with React
  - **Comprehensive Reports**: Detailed security and code quality
  reports

  ### 🔒 Security Focus
  - **Vulnerability Detection**: Identify security issues in code
  changes
  - **Risk Scoring**: Quantified risk assessment for pull requests
  - **Security Alerts**: Real-time notifications for security concerns
  - **Best Practices**: Recommendations following security standards

  ## 🛠️ Technology Stack

  ### Frontend
  - **React 18** - Modern UI library with hooks
  - **TypeScript** - Type-safe JavaScript development
  - **Vite** - Fast build tool and development server
  - **Tailwind CSS** - Utility-first CSS framework
  - **shadcn/ui** - Modern component library

  ### Backend
  - **Node.js/Express** - Server-side runtime and framework
  - **Supabase** - Backend-as-a-Service platform
  - **Supabase Edge Functions** - Serverless function execution

  ### AI & APIs
  - **Anthropic Claude** - Advanced AI for code analysis
  - **GitHub API** - Repository and pull request data
  - **Octokit** - GitHub API client library

  ### Development Tools
  - **ESLint** - Code linting and quality checks
  - **PostCSS** - CSS processing and optimization
  - **Concurrently** - Run multiple commands simultaneously

  ## 🚀 Getting Started

  ### Prerequisites

  ```bash
  Node.js >= 16.0.0
  npm >= 8.0.0
  Git
  ```

  ### Installation

  1. **Clone the repository**
  ```bash
  git clone https://github.com/your-username/code-sentinel-bot.git
  cd code-sentinel-bot
  ```

  2. **Install dependencies**
  ```bash
  npm install
  ```

  3. **Environment Setup**
  Create a `.env` file in the root directory:
  ```env
  VITE_CLAUDE_API_KEY=your_claude_api_key_here
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

  4. **Start development servers**
  ```bash
  # Start both frontend and backend
  npm run dev:full

  # Or run separately
  npm run dev      # Frontend only
  npm run server   # Backend only
  ```

  5. **Open your browser**
  Navigate to `http://localhost:5173` to access the application.

  ## 📁 Project Structure

  ```
  code-sentinel-bot/
  ├── src/
  │   ├── components/          # React components
  │   │   ├── ui/             # Reusable UI components
  │   │   ├── GitHubRepoInput.tsx
  │   │   ├── PRAnalysisCard.tsx
  │   │   ├── RAGChatbot.tsx
  │   │   └── ...
  │   ├── services/           # API service functions
  │   │   ├── githubService.ts
  │   │   └── ragService.ts
  │   ├── hooks/              # Custom React hooks
  │   ├── lib/                # Utility functions
  │   ├── pages/              # Application pages
  │   └── types/              # TypeScript type definitions
  ├── supabase/
  │   └── functions/          # Supabase Edge Functions
  │       ├── analyze-repository/
  │       └── claude-chat/
  ├── public/                 # Static assets
  ├── server.js              # Express server for Claude API proxy
  └── package.json           # Dependencies and scripts
  ```

  ## 🔧 Available Scripts

  ```bash
  npm run dev          # Start Vite dev server
  npm run build        # Build for production
  npm run server       # Start Express server
  npm run dev:full     # Start both frontend and backend
  npm run lint         # Run ESLint
  npm run preview      # Preview production build
  ```

  ## 🔑 API Keys Setup

  ### Claude API Key
  1. Visit [Anthropic Console](https://console.anthropic.com/)
  2. Create an account and generate an API key
  3. Add to your `.env` file as `VITE_CLAUDE_API_KEY`

  ### Supabase Setup
  1. Create a project at [Supabase](https://supabase.com/)
  2. Get your project URL and anon key
  3. Add to your `.env` file

  ### GitHub Token (Optional)
  For higher rate limits, create a GitHub personal access token:
  1. Go to GitHub Settings > Developer settings > Personal access
  tokens
  2. Generate a token with `public_repo` scope
  3. Use in API requests for better rate limits

  ## 🚀 Deployment

  ### Frontend (Vercel/Netlify)
  1. Build the project: `npm run build`
  2. Deploy the `dist` folder to your preferred platform
  3. Set environment variables in your deployment platform

  ### Backend (Railway/Heroku)
  1. Deploy the Express server (`server.js`)
  2. Set the `VITE_CLAUDE_API_KEY` environment variable
  3. Ensure proper CORS configuration for your frontend domain

  ### Supabase Functions
  ```bash
  # Deploy edge functions
  supabase functions deploy analyze-repository
  supabase functions deploy claude-chat
  ```

  ## 🔒 Security Considerations

  - **API Keys**: Never commit API keys to version control
  - **CORS**: Configure CORS properly for production
  - **Rate Limiting**: Implement rate limiting for API endpoints
  - **Input Validation**: Validate all user inputs
  - **Environment Variables**: Use environment variables for sensitive
   data

  ## 🤝 Contributing

  1. **Fork the repository**
  2. **Create a feature branch**
     ```bash
     git checkout -b feature/amazing-feature
     ```
  3. **Commit your changes**
     ```bash
     git commit -m 'Add some amazing feature'
     ```
  4. **Push to the branch**
     ```bash
     git push origin feature/amazing-feature
     ```
  5. **Open a Pull Request**

  ## 📖 Usage Examples

  ### Analyzing a Repository
  1. Enter a GitHub repository URL (e.g.,
  `https://github.com/facebook/react`)
  2. Click "Analyze Repository"
  3. View pull requests and their security analysis
  4. Interact with the AI chatbot for specific questions

  ### Understanding Risk Scores
  - **0-30%**: Low risk (green)
  - **31-70%**: Medium risk (yellow)
  - **71-100%**: High risk (red)

  ## 🐛 Troubleshooting

  ### Common Issues

  **Claude API not working**
  - Verify your API key is correct
  - Check you have sufficient credits
  - Ensure proper environment variable setup

  **GitHub API rate limiting**
  - Use a GitHub personal access token
  - Implement caching for repeated requests
  - Consider using GitHub Apps for higher limits

  **Build errors**
  - Clear node_modules and reinstall: `rm -rf node_modules && npm
  install`
  - Check Node.js version compatibility
  - Verify all environment variables are set

  ## 📄 License

  This project is licensed under the MIT License - see the
  [LICENSE](LICENSE) file for details.

  ## 🙏 Acknowledgments

  - [Anthropic](https://anthropic.com/) for Claude AI
  - [Supabase](https://supabase.com/) for backend infrastructure
  - [shadcn/ui](https://ui.shadcn.com/) for beautiful components
  - [GitHub](https://github.com/) for the API and platform

  ## 📞 Support

  - Create an
  [issue](https://github.com/your-username/code-sentinel-bot/issues)
  for bug reports
  - Start a [discussion](https://github.com/your-username/code-sentine
  l-bot/discussions) for questions
  - Follow the project for updates

  ---
