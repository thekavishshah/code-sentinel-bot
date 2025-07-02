import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubRepoInput } from '../GitHubRepoInput';

// Mock the GitHub service
const mockGitHubService = {
  getDetailedPullRequests: vi.fn()
};

vi.mock('@/services/githubService', () => ({
  githubService: mockGitHubService
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

describe('GitHubRepoInput', () => {
  const mockOnRepositoryAnalyzed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the input form correctly', () => {
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    expect(screen.getByText('Real-Time GitHub Repository Analysis')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://github.com/facebook/react')).toBeInTheDocument();
    expect(screen.getByText('Analyze Repository')).toBeInTheDocument();
  });

  it('displays badges for features', () => {
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    expect(screen.getByText('Live GitHub API')).toBeInTheDocument();
    expect(screen.getByText('Claude AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('Real Security Scanning')).toBeInTheDocument();
  });

  it('shows example repository URLs', () => {
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    expect(screen.getByText('Try: https://github.com/facebook/react')).toBeInTheDocument();
    expect(screen.getByText('Try: https://github.com/microsoft/vscode')).toBeInTheDocument();
  });

  it('validates empty input', async () => {
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const analyzeButton = screen.getByText('Analyze Repository');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a repository URL')).toBeInTheDocument();
    });
  });

  it('validates invalid URL format', async () => {
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid GitHub repository URL/)).toBeInTheDocument();
    });
  });

  it('accepts valid GitHub URLs', async () => {
    const mockData = {
      repository: { name: 'test-repo', owner: 'test-owner' },
      pullRequests: [{ id: 1, title: 'Test PR' }]
    };
    
    mockGitHubService.getDetailedPullRequests.mockResolvedValue(mockData);
    
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'https://github.com/facebook/react' } });
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockGitHubService.getDetailedPullRequests).toHaveBeenCalledWith('https://github.com/facebook/react');
    });
  });

  it('shows loading state during analysis', async () => {
    mockGitHubService.getDetailedPullRequests.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ pullRequests: [] }), 100))
    );
    
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(analyzeButton);
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });

  it('calls onRepositoryAnalyzed with data on successful analysis', async () => {
    const mockData = {
      repository: { name: 'test-repo', owner: 'test-owner' },
      pullRequests: [{ id: 1, title: 'Test PR' }]
    };
    
    mockGitHubService.getDetailedPullRequests.mockResolvedValue(mockData);
    
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockOnRepositoryAnalyzed).toHaveBeenCalledWith(mockData);
    });
  });

  it('shows success toast for analysis with PRs', async () => {
    const mockData = {
      repository: { name: 'test-repo' },
      pullRequests: [{ id: 1, title: 'Test PR' }]
    };
    
    mockGitHubService.getDetailedPullRequests.mockResolvedValue(mockData);
    
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Analysis Complete",
        description: "Analyzed 1 pull requests with detailed GitHub data."
      });
    });
  });

  it('shows info toast for repositories with no PRs', async () => {
    const mockData = {
      repository: { name: 'test-repo' },
      pullRequests: []
    };
    
    mockGitHubService.getDetailedPullRequests.mockResolvedValue(mockData);
    
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "No Open Pull Requests",
        description: "This repository has no open pull requests to analyze.",
        variant: "default"
      });
    });
  });

  it('handles analysis errors gracefully', async () => {
    const errorMessage = 'API rate limit exceeded';
    mockGitHubService.getDetailedPullRequests.mockRejectedValue(new Error(errorMessage));
    
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    });
  });

  it('clears error when input changes', async () => {
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    // Trigger error
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a repository URL')).toBeInTheDocument();
    });
    
    // Clear error by typing
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    
    expect(screen.queryByText('Please enter a repository URL')).not.toBeInTheDocument();
  });

  it('disables input and button during analysis', async () => {
    mockGitHubService.getDetailedPullRequests.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ pullRequests: [] }), 100))
    );
    
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(analyzeButton);
    
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });

  it('validates GitHub URL pattern correctly', () => {
    render(<GitHubRepoInput onRepositoryAnalyzed={mockOnRepositoryAnalyzed} />);
    
    const input = screen.getByPlaceholderText('https://github.com/facebook/react');
    const analyzeButton = screen.getByText('Analyze Repository');
    
    // Test invalid URLs
    const invalidUrls = [
      'http://github.com/user/repo',
      'https://gitlab.com/user/repo',
      'https://github.com/user',
      'github.com/user/repo',
      'https://github.com/user/repo/issues'
    ];
    
    invalidUrls.forEach(url => {
      fireEvent.change(input, { target: { value: url } });
      fireEvent.click(analyzeButton);
      
      expect(screen.getByText(/Please enter a valid GitHub repository URL/)).toBeInTheDocument();
    });
  });
});