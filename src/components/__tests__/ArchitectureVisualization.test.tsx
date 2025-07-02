import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchitectureVisualization } from '../ArchitectureVisualization';

// Mock mermaid module
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn().mockResolvedValue(undefined),
    render: vi.fn().mockResolvedValue({ svg: '<svg>Test SVG</svg>' })
  }
}));

describe('ArchitectureVisualization', () => {
  const mockRepository = {
    name: 'test-repo',
    language: 'TypeScript',
    stars: 100,
    openPRs: 5,
    owner: 'test-owner'
  };

  const mockPullRequest = {
    id: 1,
    title: 'Test PR',
    number: 123
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock DOM methods
    Object.defineProperty(document, 'getElementById', {
      value: vi.fn().mockReturnValue({
        innerHTML: ''
      }),
      writable: true
    });
  });

  it('renders loading state initially', () => {
    render(<ArchitectureVisualization />);
    
    expect(screen.getByText('Initializing diagram renderer...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders repository architecture title', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('Repository Architecture')).toBeInTheDocument();
    });
  });

  it('displays repository name in description when provided', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText(/test-repo/)).toBeInTheDocument();
    });
  });

  it('shows interactive badge when mermaid is available', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('Interactive')).toBeInTheDocument();
    });
  });

  it('renders all three tabs (overview, technical, dataflow)', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Technical Stack')).toBeInTheDocument();
      expect(screen.getByText('Data Flow')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      const technicalTab = screen.getByText('Technical Stack');
      fireEvent.click(technicalTab);
      
      expect(screen.getByText('Technical stack visualization showing technologies and their integration points')).toBeInTheDocument();
    });
  });

  it('displays repository stats correctly', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('100⭐')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('handles missing repository data gracefully', async () => {
    render(<ArchitectureVisualization />);
    
    await waitFor(() => {
      expect(screen.getByText(/the repository/)).toBeInTheDocument();
    });
  });

  it('detects different tech stacks correctly', async () => {
    const pythonRepo = { ...mockRepository, language: 'Python', name: 'django-app' };
    render(<ArchitectureVisualization repository={pythonRepo} />);
    
    await waitFor(() => {
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });

  it('shows static fallback when mermaid fails', async () => {
    // Mock mermaid to fail
    vi.doMock('mermaid', () => ({
      default: {
        initialize: vi.fn().mockRejectedValue(new Error('Mermaid failed')),
        render: vi.fn()
      }
    }));

    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('Interactive diagram loading...')).toBeInTheDocument();
    });
  });

  it('renders with pull request data', async () => {
    render(<ArchitectureVisualization repository={mockRepository} pullRequest={mockPullRequest} />);
    
    await waitFor(() => {
      expect(screen.getByText('Repository Architecture')).toBeInTheDocument();
    });
  });

  it('generates correct overview diagram data', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('High-level architecture overview showing main components and their relationships')).toBeInTheDocument();
    });
  });

  it('generates correct dataflow diagram data', async () => {
    render(<ArchitectureVisualization repository={mockRepository} />);
    
    await waitFor(() => {
      const dataFlowTab = screen.getByText('Data Flow');
      fireEvent.click(dataFlowTab);
      
      expect(screen.getByText('Sequence diagram showing how data flows through the system during analysis')).toBeInTheDocument();
    });
  });

  it('handles repository stats with default values', async () => {
    const minimalRepo = { name: 'minimal-repo' };
    render(<ArchitectureVisualization repository={minimalRepo} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});