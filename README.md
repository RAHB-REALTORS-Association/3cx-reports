# 📞 3CX Call Reports Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Build](https://github.com/RAHB-REALTORS-Association/3cx-reports/actions/workflows/ci.yml/badge.svg)](https://github.com/RAHB-REALTORS-Association/3cx-reports/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A comprehensive web application for analyzing and visualizing 3CX call system data. Upload CSV reports and get instant insights into call patterns, agent performance, and key metrics through interactive charts and detailed analytics.

![Screenshot](public/qstats-screenshot.png)

## ✨ Key Features

* **Drag & Drop CSV Upload** — Easily import your 3CX call reports
* **Interactive Visualizations** — Includes:
  * Bar charts for call volume analysis
  * KPI grids for quick metrics overview
  * Agent performance tables
* **Dynamic Filtering** — Filter data by:
  * Date ranges
  * Call types
  * Agent performance
* **Real-time Analytics** — Instant calculations for:
  * Call volumes
  * Average call duration
  * Agent statistics
* **Responsive Design** — Works seamlessly across desktop, tablet, and mobile devices

## 🚀 Getting Started

### Requirements

* Node.js v14+
* npm or yarn

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/RAHB-REALTORS-Association/3cx-reports.git
   cd 3cx-reports
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. Open your browser at [http://localhost:3000](http://localhost:3000)

### 🐳 Docker Deployment

You can also run the application using Docker:

1. **Build the Docker image**

   ```bash
   docker build -t 3cx-reports .
   ```

2. **Run the container**

   ```bash
   docker run -p 80:80 3cx-reports
   ```

3. Open your browser at [http://localhost](http://localhost)

## 🛠️ How to Use

1. **Upload Your Data**
   * Drag and drop your 3CX CSV report file into the upload zone
   * Supported formats: CSV files from 3CX call reports

2. **Explore Your Data**
   * View agent performance metrics in the sortable table
   * Analyze call patterns with interactive bar charts
   * Monitor KPIs in the summary grid

3. **Filter and Analyze**
   * Use date range controls to focus on specific periods
   * Apply filters to drill down into specific data segments

## 📊 Components Overview

* **AgentTable** — Sortable table displaying agent performance metrics
* **BarChart** — Interactive bar charts for call volume visualization
* **ChartGrid** — Grid layout for multiple chart displays
* **Controls** — Data filtering and control panel
* **KpiGrid** — Key performance indicators dashboard
* **Dropzone** — File upload interface with drag-and-drop support

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## 🌍 Deployment Options

Deploy to any static hosting provider:
* Vercel
* Netlify
* GitHub Pages
* AWS S3 + CloudFront

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 🙌 Built With

* **React** — Frontend framework
* **Create React App** — Build toolchain
* **Modern JavaScript** — ES6+ features
* **CSS3** — Responsive styling

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
