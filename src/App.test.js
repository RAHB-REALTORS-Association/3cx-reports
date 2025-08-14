import { render, screen } from '@testing-library/react';
import App from './App';

describe('3CX Reports Dashboard', () => {
  test('renders dashboard title', () => {
    render(<App />);
    const titleElement = screen.getByText(/queue agent statistics/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders date controls', () => {
    render(<App />);
    // Check for date input fields by their specific attributes
    const fromDateInput = screen.getByRole('textbox', { name: /from/i });
    const toDateInput = screen.getByRole('textbox', { name: /to/i });
    
    expect(fromDateInput).toBeInTheDocument();
    expect(toDateInput).toBeInTheDocument();
    expect(fromDateInput).toHaveAttribute('type', 'date');
    expect(toDateInput).toHaveAttribute('type', 'date');
  });

  test('renders quick date buttons', () => {
    render(<App />);
    const todayButton = screen.getByText(/today/i);
    const yesterdayButton = screen.getByText(/yesterday/i);
    const last7Button = screen.getByText(/last 7/i);
    expect(todayButton).toBeInTheDocument();
    expect(yesterdayButton).toBeInTheDocument();
    expect(last7Button).toBeInTheDocument();
  });

  test('renders build dashboard button', () => {
    render(<App />);
    const buildButton = screen.getByText(/build dashboard/i);
    expect(buildButton).toBeInTheDocument();
  });

  test('renders file upload dropzone', () => {
    render(<App />);
    const dropzoneText = screen.getByText(/drag & drop csvs here/i);
    expect(dropzoneText).toBeInTheDocument();
  });

  test('renders data management buttons', () => {
    render(<App />);
    const clearButton = screen.getByText(/clear data/i);
    const exportButton = screen.getByText(/export data/i);
    const importButton = screen.getByText(/import/i);
    expect(clearButton).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();
    expect(importButton).toBeInTheDocument();
  });

  test('renders github link in header', () => {
    render(<App />);
    const githubLink = screen.getByTitle(/view on github/i);
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/RAHB-REALTORS-Association/3cx-reports');
  });

  test('renders dark mode toggle', () => {
    render(<App />);
    const darkModeToggle = screen.getByTitle(/switch to dark mode/i);
    expect(darkModeToggle).toBeInTheDocument();
  });

  test('renders footer with cornerstone link', () => {
    render(<App />);
    const cornerstoneLink = screen.getByText(/cornerstone\.inc/i);
    expect(cornerstoneLink).toBeInTheDocument();
    expect(cornerstoneLink).toHaveAttribute('href', 'https://www.cornerstone.inc');
  });

  test('does not render filters when no data is loaded', () => {
    render(<App />);
    // Should not have queue or agent filters visible when no data is loaded
    const queueFilterText = screen.queryByText(/queue filter/i);
    const agentFilterText = screen.queryByText(/agent filter/i);
    expect(queueFilterText).not.toBeInTheDocument();
    expect(agentFilterText).not.toBeInTheDocument();
  });
});
