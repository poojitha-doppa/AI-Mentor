# Career Sync - Career Roadmap Generator

A modern, AI-powered career development platform that helps professionals discover personalized career pathways based on real job market data and AI-generated roadmaps.

## 🎯 Features

- **AI-Powered Roadmaps**: Uses Google Gemini API to generate personalized 4-step career preparation roadmaps
- **Real Job Market Data**: Integrates JSearch API to fetch actual job postings and market data
- **Smart Salary Matching**: Automatically matches salary ranges from user input with actual job market offerings
- **Dynamic Career Pathways**: Shows 12 personalized career pathways with companies, roles, and timelines
- **Category Filtering**: Filter opportunities by FAANG companies, Product Companies, or High Growth Startups
- **Live Market Indicators**: Real-time job statistics including market demand and skill gaps
- **Responsive Design**: Clean, professional UI with gradient effects and smooth animations
- **Multi-Currency Support**: Supports salary inputs in USD, LPA, and other formats

## Tech Stack

- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type safety
- **Vite 5.0.8** - Build tool and dev server
- **CSS Modules** - Component-scoped styling
- **Google Gemini API** - AI roadmap generation
- **JSearch API (RapidAPI)** - Real job market data

## Project Structure

```
Project Expo/
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   └── TipBanner.tsx           # Info banner component
│   │   ├── Form/
│   │   │   ├── SimulationForm.tsx      # Main input form
│   │   │   ├── SkillsInput.tsx         # Skills input component
│   │   │   └── *.module.css            # Component styles
│   │   ├── Layout/
│   │   │   ├── Header.tsx              # Navigation header
│   │   │   └── Footer.tsx              # Footer with links
│   │   ├── Modals/
│   │   │   └── APIConfigurationModal.tsx  # API config dialog
│   │   └── Results/
│   │       ├── SimulationResults.tsx   # Results page layout
│   │       ├── PathwayCard.tsx         # Individual pathway card
│   │       ├── StatsCard.tsx           # Statistics card
│   │       └── AlertBanner.tsx         # Alert notifications
│   ├── pages/
│   │   ├── HomePage.tsx                # Landing page
│   │   └── ResultsPage.tsx             # Results display page
│   ├── services/
│   │   └── simulationService.ts        # API integration & logic
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces
│   ├── styles/
│   │   └── globals.css                 # Global styles
│   ├── App.tsx                         # Main app component
│   └── main.tsx                        # Entry point
├── package.json                        # Project dependencies
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite bundler config
└── index.html                          # HTML template
```

## Getting Started

### Prerequisites

- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **npm**: v7 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **API Keys** (required):
  - Google Gemini API key
  - RapidAPI key for JSearch API

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will open at `http://localhost:5173`

## Usage

### 1. Configure API Keys

Before running the application, you must add your API keys:

1. Open `src/services/simulationService.ts`
2. Find lines 3-8 and replace with your keys:

```typescript
const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY_HERE';
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

### 2. How to Get API Keys

**Google Gemini API:**
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Click "Create API Key"
- Copy and paste into the code

**JSearch API:**
- Sign up at [RapidAPI](https://rapidapi.com/)
- Search for "JSearch"
- Subscribe to free plan
- Copy API key

### 3. Using the Application

1. **Home Page**: Fill in your career form:
   - Current Position
   - Target Position
   - Core Competencies (add multiple)
   - Daily Learning Commitment (hours/day)
   - Target Annual Compensation

2. **Submit**: Click "Generate Career Roadmap"

3. **Results Page**: 
   - View 4 key statistics
   - Filter by company type (FAANG, Product, Startups)
   - Sort results by salary, relevance, etc.
   - Expand pathways to see AI-generated roadmaps
   - Load more results (6 at a time)

## Features in Detail

### Form Validation
- All required fields must be filled before submission
- Generate button is disabled until form is complete
- Loading spinner shows during simulation (2-4 seconds)
- Salary supports multiple formats: "₹25-30 LPA", "$50K", "50000 USD"

### Pathway Cards
- Display difficulty level (MEDIUM/HIGH)
- Show salary range matched to your target salary
- Include timeline to achieve role
- Data source indicator (LinkedIn, Indeed, etc.)
- Expandable to show:
  - AI-generated 4-step roadmap
  - Specific courses, projects, and resources
  - Interview preparation strategies
  - Application timeline

### Statistics Cards
- **Career Pathways Evaluated**: Total opportunities analyzed
- **Market Opportunity Level**: Demand for target role
- **Priority Skill to Develop**: Most requested skill
- **Intelligence Sources**: Data sources used (with live indicator)

### Smart Features
- **Dynamic Salary Matching**: Results match your target salary automatically
- **Real Job Data**: Uses JSearch API for current job postings
- **AI Roadmaps**: Gemini AI generates personalized 4-step plans
- **Category Filtering**: Filter by FAANG, Product, or Startups
- **Pagination**: Load 6 results at a time

## Styling

The application uses:
- **CSS Modules** for component-scoped styles
- **Gradient borders** and animations for modern UI
- **Mobile-first responsive design**
- No external utility frameworks (no Tailwind)

### Key Features:
- Smooth hover effects on cards
- Gradient backgrounds with linear color transitions
- Live indicator pulse animation
- Shimmer effect on load button
- Professional color palette

## State Management

- React `useState` hooks for local component state
- Props passing for page-level navigation
- TypeScript interfaces for type safety

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### API Key Issues
- Verify keys are copied correctly (no extra spaces)
- Ensure JSearch is activated on RapidAPI
- Check Gemini API is enabled in Google Cloud

### Results Not Loading
- Check browser console (F12) for errors
- Verify internet connection
- Confirm API keys are active
- Try refreshing the page

### Salary Range Issues
- Include currency indicator (LPA, USD, $, ₹)
- Format examples: "₹25-30 LPA", "$50K"
- Clear browser cache and reload

### Port Already in Use
```bash
npm run dev -- --port 3000
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables**:
   ```bash
   # Create .env.local
   VITE_GEMINI_API_KEY=your_key
   VITE_RAPIDAPI_KEY=your_key
   ```

3. **Update dependencies** regularly:
   ```bash
   npm update && npm audit
   ```

4. **Use backend proxy** for production to hide keys

## API Rate Limits

- **JSearch**: ~100 requests/month (free tier)
- **Gemini**: 60 requests/minute (free tier)
- **Tip**: Implement caching for repeated searches

## Customization Examples

### Change Platform Name
Edit `src/components/Layout/Header.tsx`:
```typescript
<h1>Your Platform Name</h1>
```

### Add More Companies
Edit `src/services/simulationService.ts` line 12:
```typescript
const COMPANIES = [
  'Google', 'Microsoft',
  'YourCompany',  // Add here
];
```

### Modify Color Scheme
Edit CSS in component folders:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## FAQ

**Q: Free API access available?**
A: Yes, both Gemini and JSearch have free tiers with usage limits.

**Q: Real-time job data?**
A: Yes, JSearch provides current job postings.

**Q: Can I modify roadmaps?**
A: Yes, edit `generateAIRoadmap()` in `simulationService.ts`.

**Q: Offline capability?**
A: App works offline after loading; APIs required for data.

## Enhancement Ideas

- User accounts and saved pathways
- Advanced filtering (location, visa sponsorship)
- Interview prep with role-specific questions
- Skill progression tracking
- Community reviews and ratings
- Mobile app (React Native)
- Dark mode toggle

## Support Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Gemini API](https://ai.google.dev/docs)
- [JSearch API](https://rapidapi.com/letscrape-6bkfd69d498e/api/jsearch)

## Quick Start Checklist

- [ ] Node.js v16+ installed
- [ ] `npm install` completed
- [ ] API keys obtained
- [ ] Keys configured in `simulationService.ts`
- [ ] `npm run dev` started
- [ ] Browser opened to `http://localhost:5173`
- [ ] Form tested with sample data
- [ ] Results displaying correctly

## License

This project is provided as-is for educational and commercial use.

---

**Ready to go! Happy career planning with PathForge AI! 🚀**
