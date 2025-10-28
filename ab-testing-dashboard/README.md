# RIT A/B Testing Workshop Dashboard

An interactive React dashboard for analyzing A/B testing workshop results from RIT's Social Media Marketing class. This tool provides comprehensive analysis of student voting patterns, test results, and qualitative insights.

## 🎯 Features

### 📊 Overview Page
- Hero statistics cards showing total responses, students, tests, and average consensus
- Overall variant preference breakdown (A vs B)
- Test type comparison charts (Image vs Copy)
- Winner distribution visualizations

### 🧪 Test Results Page
- Sortable and filterable table of all A/B tests
- Expandable rows showing detailed analysis:
  - Vote distribution charts
  - Click likelihood comparisons
  - Student comments for each test
- Filters by test type, winner, and consensus threshold
- Export filtered results to CSV

### 👥 Student Analysis Page
- Individual student voting patterns and statistics
- Interactive scatter plot: Bias Score vs Comment Engagement
- Visual heatmap: Students × Tests matrix
- Expandable student voting history
- Metrics: bias scores, average click likelihood, comment rates

### 💬 Qualitative Insights Page
- All student comments organized by test
- Advanced filtering:
  - Search text in comments
  - Filter by test name, type, variant selected, or student
- Context displays: which variant was chosen, click likelihood scores
- Export filtered comments to CSV

### 📈 Patterns & Insights Page
- Statistical analysis and correlations
- Most decisive tests (highest consensus)
- Most polarizing tests (closest to 50/50)
- Brand performance analysis
- Image vs Copy deep dive comparison
- Click-vote alignment metrics

## 🛠 Technology Stack

- **React** - UI framework
- **Recharts** - Data visualizations (charts, scatter plots)
- **PapaParse** - CSV file parsing
- **Tailwind CSS** - Styling and responsive design
- **GitHub Pages** - Deployment platform

## 📁 Data Structure

The dashboard loads 5 CSV files from the `/public/data` directory:

1. **1_master_dataset.csv** - All 396 individual student responses
2. **2_test_summary.csv** - Aggregated results per test
3. **3_test_type_patterns.csv** - Image vs Copy performance comparison
4. **4_student_patterns.csv** - Individual student voting behavior
5. **5_all_comments.csv** - Qualitative feedback from students

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/profAlexButler/mktg430-ABResults.git
cd mktg430-ABResults/ab-testing-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📦 Building for Production

Create an optimized production build:

```bash
npm run build
```

The build folder will contain the production-ready files.

## 🌐 Deploying to GitHub Pages

Deploy the dashboard to GitHub Pages:

```bash
npm run deploy
```

This will:
1. Build the production version
2. Push to the `gh-pages` branch
3. Make the dashboard available at: https://profAlexButler.github.io/mktg430-ABResults

### GitHub Pages Configuration

Ensure GitHub Pages is enabled in your repository settings:
1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages` / `root`

## 🎨 Customization

### Branding Colors

The dashboard uses RIT orange (#F76902) as the primary color. To customize:

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'rit-orange': '#F76902', // Change this to your brand color
    },
  },
}
```

### Data Updates

To update the dashboard with new data:

1. Replace CSV files in `/public/data/` with updated versions
2. Ensure column names match the original structure
3. Rebuild and redeploy

### Adding New Metrics

The dashboard is modular. To add new visualizations:

1. Edit the relevant component in `/src/components/`
2. Import additional Recharts components as needed
3. Calculate new metrics in the component using `useMemo` hooks

## 📊 Key Metrics Explained

- **Consensus Score**: Percentage indicating decisiveness (0% = tie, 100% = unanimous)
- **Vote Margin**: Difference in votes between variants
- **Click Likelihood Gap**: Difference in average click scores (1-5 scale)
- **Bias Score**: Student's preference for A vs B (positive = prefers A)
- **Comment Rate**: Percentage of tests where student left comments

## 🔧 Project Structure

```
ab-testing-dashboard/
├── public/
│   └── data/               # CSV data files
├── src/
│   ├── components/         # React components for each page
│   │   ├── Overview.js
│   │   ├── TestResults.js
│   │   ├── StudentAnalysis.js
│   │   ├── QualitativeInsights.js
│   │   └── PatternsInsights.js
│   ├── services/
│   │   └── dataService.js  # CSV loading and export utilities
│   ├── App.js              # Main app with navigation
│   └── index.css           # Tailwind CSS imports
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

## 🐛 Troubleshooting

### Data Not Loading
- Check browser console for errors
- Ensure CSV files are in `/public/data/`
- Verify CSV files have correct column headers

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

### GitHub Pages Not Updating
- Check GitHub Actions tab for deployment status
- Ensure `gh-pages` branch exists
- Wait 2-3 minutes for deployment to propagate

## 📝 License

This project is for educational use in RIT's Social Media Marketing class.

## 👨‍🏫 Course Information

- **Course**: Social Media Marketing
- **Institution**: Rochester Institute of Technology (RIT)
- **Exercise**: A/B Testing Workshop
- **Participants**: 22 Students
- **Tests**: 18 Different Social Media Post Variants

## 🤝 Contributing

To modify or extend the dashboard:

1. Create a new branch
2. Make your changes
3. Test locally with `npm start`
4. Build with `npm run build`
5. Submit a pull request

## 📧 Contact

For questions about this dashboard, contact the course instructor.

---

Built with React and deployed on GitHub Pages
