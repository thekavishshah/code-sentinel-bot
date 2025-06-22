import Anthropic from '@anthropic-ai/sdk';
import { Octokit } from '@octokit/rest';
import cosineSimilarity from 'cosine-similarity';

export interface FileChunk {
  id: string;
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
  embedding?: number[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface RepositoryData {
  owner: string;
  repo: string;
  url: string;
  chunks: FileChunk[];
  embeddings: Map<string, number[]>;
}

class RAGService {
  private anthropic: Anthropic;
  private octokit: Octokit;
  private repositories: Map<string, RepositoryData> = new Map();
  
  constructor() {
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    console.log(`🔑 Initializing RAG Service...`);
    console.log(`🔑 Claude API key present: ${apiKey ? 'YES' : 'NO'}`);
    console.log(`🔑 Claude API key length: ${apiKey ? apiKey.length : 0}`);
    console.log(`🔑 Claude API key starts with: ${apiKey ? apiKey.substring(0, 15) + '...' : 'N/A'}`);
    
    if (!apiKey) {
      console.error(`❌ VITE_CLAUDE_API_KEY is missing from environment variables`);
      throw new Error('VITE_CLAUDE_API_KEY is required');
    }
    
    if (!apiKey.startsWith('sk-ant-')) {
      console.warn(`⚠️ Claude API key doesn't start with expected prefix 'sk-ant-'`);
    }
    
    try {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      } as any);
    } catch (initError) {
      console.error(`❌ Failed to initialize Anthropic client:`, initError);
      throw initError;
    }
    
    console.log(`✅ Anthropic client initialized`);
    
    const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
    console.log(`🐙 GitHub token present: ${githubToken ? 'YES' : 'NO'}`);
    
    this.octokit = new Octokit({
      auth: githubToken || undefined
    });
    
    console.log(`✅ RAG Service initialization complete`);
  }

  // Chunk text into ~1000 character segments while preserving line boundaries
  private chunkText(content: string, filePath: string): FileChunk[] {
    const lines = content.split('\n');
    const chunks: FileChunk[] = [];
    let currentChunk = '';
    let startLine = 1;
    let currentLine = 1;
    
    for (const line of lines) {
      const potentialChunk = currentChunk + (currentChunk ? '\n' : '') + line;
      
      if (potentialChunk.length > 1000 && currentChunk.length > 0) {
        // Create chunk from current content
        chunks.push({
          id: `${filePath}:${startLine}-${currentLine - 1}`,
          filePath,
          content: currentChunk.trim(),
          startLine,
          endLine: currentLine - 1
        });
        
        // Start new chunk
        currentChunk = line;
        startLine = currentLine;
      } else {
        currentChunk = potentialChunk;
      }
      
      currentLine++;
    }
    
    // Add remaining content as final chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `${filePath}:${startLine}-${currentLine - 1}`,
        filePath,
        content: currentChunk.trim(),
        startLine,
        endLine: currentLine - 1
      });
    }
    
    return chunks;
  }

  // Convert file content to markdown format
  private convertToMarkdown(content: string, filePath: string): string {
    const filename = filePath.split('/').pop() || filePath;
    const extension = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : '';
    
    // Get appropriate language identifier for syntax highlighting
    const getLanguage = (ext: string): string => {
      const langMap: { [key: string]: string } = {
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'h': 'c',
        'css': 'css',
        'scss': 'scss',
        'sass': 'sass',
        'less': 'less',
        'html': 'html',
        'htm': 'html',
        'xml': 'xml',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml',
        'toml': 'toml',
        'ini': 'ini',
        'cfg': 'ini',
        'conf': 'ini',
        'md': 'markdown',
        'txt': 'text',
        'rst': 'rst',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'kt': 'kotlin',
        'swift': 'swift',
        'scala': 'scala',
        'sh': 'bash',
        'bash': 'bash',
        'zsh': 'bash',
        'fish': 'bash',
        'ps1': 'powershell',
        'bat': 'batch',
        'sql': 'sql',
        'graphql': 'graphql',
        'gql': 'graphql',
        'proto': 'protobuf',
        'vue': 'vue',
        'svelte': 'svelte',
        'elm': 'elm',
        'clj': 'clojure',
        'cljs': 'clojure',
        'dockerfile': 'dockerfile',
        'makefile': 'makefile',
        'gradle': 'gradle',
        'cmake': 'cmake',
        'r': 'r',
        'dart': 'dart',
        'lua': 'lua',
        'perl': 'perl',
        'asm': 'assembly',
        'vim': 'vim'
      };
      
      return langMap[ext] || 'text';
    };

    const language = getLanguage(extension || '');
    const fileSize = content.length;
    const lineCount = content.split('\n').length;
    
    // Create markdown with metadata header and syntax-highlighted content
    const markdown = `# File: ${filePath}

**File Information:**
- **Path:** ${filePath}
- **Size:** ${fileSize} bytes
- **Lines:** ${lineCount}
- **Language:** ${language}

---

\`\`\`${language}
${content}
\`\`\`
`;

    return markdown;
  }

  // Check if file should be processed (much more permissive now)
  private shouldProcessFile(filename: string, size: number): boolean {
    // Only skip clearly binary files and very large files
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp',
      '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
      '.exe', '.dll', '.so', '.dylib', '.bin',
      '.woff', '.woff2', '.ttf', '.eot', '.otf',
      '.mp4', '.mp3', '.avi', '.mov', '.wav', '.flac',
      '.psd', '.ai', '.sketch', '.fig'
    ];
    
    const skipFiles = [
      'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock',
      '.DS_Store', 'Thumbs.db', 'desktop.ini'
    ];
    
    // Skip very large files (1MB+)
    if (size > 1000000) {
      console.log(`Skipping very large file: ${filename} (${(size / 1024 / 1024).toFixed(2)}MB)`);
      return false;
    }
    
    // Skip clearly binary files
    if (binaryExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
      console.log(`Skipping binary file: ${filename}`);
      return false;
    }
    
    // Skip specific lock files and system files
    if (skipFiles.includes(filename)) {
      console.log(`Skipping system/lock file: ${filename}`);
      return false;
    }
    
    // Include everything else (much more permissive)
    console.log(`Including file: ${filename}`);
    return true;
  }

  // Extract owner and repo from GitHub URL
  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, '')
    };
  }

  // Recursively fetch repository contents
  private async fetchRepositoryContents(owner: string, repo: string, path = ''): Promise<any[]> {
    try {
      console.log(`Fetching contents for: ${owner}/${repo}${path ? `/${path}` : ''}`);
      
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });
      
      const files: any[] = [];
      
      if (Array.isArray(data)) {
        console.log(`Found ${data.length} items in ${path || 'root'}`);
        
        for (const item of data) {
          if (item.type === 'file' && this.shouldProcessFile(item.name, item.size || 0)) {
            console.log(`Adding file: ${item.path} (${item.size} bytes)`);
            files.push(item);
          } else if (item.type === 'dir' && !item.name.startsWith('.') && 
                     item.name !== 'node_modules' && item.name !== 'dist' && 
                     item.name !== 'build' && item.name !== '__pycache__') {
            // Recursively fetch directory contents (limited depth)
            const depth = path.split('/').filter(p => p).length;
            if (depth < 2) { // Limit recursion depth
              console.log(`Recursing into directory: ${item.path}`);
              const subFiles = await this.fetchRepositoryContents(owner, repo, item.path);
              files.push(...subFiles);
            }
          }
        }
      } else if (data.type === 'file') {
        // Single file case
        if (this.shouldProcessFile(data.name, data.size || 0)) {
          files.push(data);
        }
      }
      
      console.log(`Returning ${files.length} files from ${path || 'root'}`);
      return files;
    } catch (error) {
      console.error(`Error fetching contents for ${owner}/${repo}/${path}:`, error);
      return [];
    }
  }

  // Generate embeddings for text chunks
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Note: Anthropic doesn't have a direct embedding endpoint yet
      // For now, we'll create a simple hash-based embedding
      // In production, you might want to use OpenAI's embedding API or another service
      console.log(`🔤 Generating embedding for text: ${text.substring(0, 100)}...`);
      const hash = this.simpleHashEmbedding(text);
      console.log(`✅ Generated ${hash.length}-dimensional embedding`);
      return hash;
    } catch (error) {
      console.error('❌ Error generating embedding:', error);
      const fallback = new Array(384).fill(0).map(() => Math.random());
      console.log(`🔄 Using fallback random embedding: ${fallback.length} dimensions`);
      return fallback;
    }
  }

  // Simple hash-based embedding (placeholder for real embeddings)
  private simpleHashEmbedding(text: string): number[] {
    const embedding = new Array(384).fill(0);
    
    // Create a simple feature vector based on text characteristics
    const words = text.toLowerCase().split(/\s+/);
    const chars = text.split('');
    
    // Word frequency features
    const wordMap = new Map<string, number>();
    words.forEach(word => {
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });
    
    // Character n-gram features  
    for (let i = 0; i < Math.min(chars.length - 1, 100); i++) {
      const bigram = chars[i] + chars[i + 1];
      const hash = this.hashCode(bigram) % 384;
      embedding[Math.abs(hash)] += 1;
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Test Claude API connectivity via backend proxy
  async testClaudeAPI(): Promise<{ working: boolean; error?: string }> {
    try {
      console.log(`🧪 Testing Claude API connectivity via backend proxy...`);
      
      const response = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Say "API test successful" and nothing else.',
          maxTokens: 50
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Backend proxy error: ${response.status}`, errorData);
        return { 
          working: false, 
          error: `Backend proxy error: ${response.status} - ${errorData.error || 'Unknown error'}` 
        };
      }

      const data = await response.json();
      
      if (data.success && data.response) {
        console.log(`✅ Claude API test successful: ${data.response}`);
        return { working: true };
      } else {
        return { 
          working: false, 
          error: `Backend proxy error: ${data.error || 'Unknown error'}` 
        };
      }
    } catch (error) {
      console.error(`❌ Claude API test failed:`, error);
      return { 
        working: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test repository accessibility
  async testRepositoryAccess(repoUrl: string): Promise<{ accessible: boolean; info?: any; error?: string }> {
    try {
      const { owner, repo } = this.parseGitHubUrl(repoUrl);
      
      // Try to fetch basic repository info
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo
      });
      
      return {
        accessible: true,
        info: {
          name: data.name,
          private: data.private,
          size: data.size,
          language: data.language,
          stargazers_count: data.stargazers_count
        }
      };
    } catch (error: any) {
      return {
        accessible: false,
        error: error.message || 'Repository not accessible'
      };
    }
  }

  // Ingest repository and create embeddings
  async ingestRepository(repoUrl: string): Promise<RepositoryData> {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    const repoKey = `${owner}/${repo}`;
    
    // Check if already processed
    if (this.repositories.has(repoKey)) {
      console.log(`Repository ${repoKey} already ingested`);
      return this.repositories.get(repoKey)!;
    }
    
    console.log(`Starting ingestion for repository: ${repoKey}`);
    
    try {
      // Fetch all repository files
      const files = await this.fetchRepositoryContents(owner, repo);
      console.log(`Found ${files.length} files to process`);
      
      if (files.length === 0) {
        console.warn(`No files found for repository ${repoKey}`);
        throw new Error(`No accessible files found in repository. The repository might be empty, private, or you may need authentication.`);
      }
      
      const chunks: FileChunk[] = [];
      const embeddings = new Map<string, number[]>();
      
      // Process each file
      const filesToProcess = files.slice(0, 50); // Limit to 50 files for demo
      console.log(`Processing ${filesToProcess.length} files...`);
      
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        try {
          console.log(`Processing file ${i + 1}/${filesToProcess.length}: ${file.path}`);
          
          // Fetch file content
          const { data } = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path
          });
          
          // Try multiple methods to get file content
          let rawContent = '';
          let contentSource = '';

          // Method 1: Direct content from API
          if ('content' in data && data.content) {
            try {
              rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
              contentSource = 'API content';
            } catch (decodeError) {
              try {
                // Try latin1 encoding for binary files that might contain text
                rawContent = Buffer.from(data.content, 'base64').toString('latin1');
                contentSource = 'API content (latin1)';
              } catch (fallbackError) {
                console.warn(`Could not decode ${file.path} with UTF-8 or latin1`);
              }
            }
          }

          // Method 2: Download URL if direct content failed
          if (!rawContent && 'download_url' in data && data.download_url) {
            try {
              console.log(`Trying download URL for ${file.path}`);
              const response = await fetch(data.download_url);
              if (response.ok) {
                rawContent = await response.text();
                contentSource = 'download URL';
              }
            } catch (downloadError) {
              console.error(`Failed to download ${file.path}:`, downloadError);
            }
          }

          // Process the content if we got any
          if (rawContent) {
            console.log(`File ${file.path}: ${rawContent.length} characters from ${contentSource}`);
            
            // Skip empty files
            if (rawContent.trim().length === 0) {
              console.log(`Skipping empty file: ${file.path}`);
              continue;
            }

            // Convert to markdown format
            const markdownContent = this.convertToMarkdown(rawContent, file.path);
            console.log(`Converted ${file.path} to markdown (${markdownContent.length} chars)`);
            
            // Create chunks from markdown
            const fileChunks = this.chunkText(markdownContent, file.path);
            console.log(`Created ${fileChunks.length} chunks from ${file.path}`);
            
            if (fileChunks.length > 0) {
              chunks.push(...fileChunks);
              
              // Generate embeddings for each chunk
              for (const chunk of fileChunks) {
                const embedding = await this.generateEmbedding(chunk.content);
                embeddings.set(chunk.id, embedding);
              }
              console.log(`✅ Successfully processed ${file.path}`);
            }
          } else {
            console.warn(`❌ No content could be extracted from ${file.path}`);
          }
        } catch (error) {
          console.error(`Error processing file ${file.path}:`, error);
        }
      }
      
      if (chunks.length === 0) {
        console.error(`Ingestion failed for ${repoKey}:`);
        console.error(`- Found ${files.length} files`);
        console.error(`- Processed ${filesToProcess.length} files`);
        console.error(`- Created ${chunks.length} chunks`);
        
        // Provide more helpful error message
        let errorMsg = `No content could be extracted from the repository files.`;
        
        if (files.length === 0) {
          errorMsg += ` No files were found in the repository.`;
        } else if (filesToProcess.length === 0) {
          errorMsg += ` All ${files.length} files were filtered out (likely binary or too large).`;
        } else {
          errorMsg += ` Found ${files.length} files but could not extract text content from any of them.`;
        }
        
        errorMsg += ` Please check the browser console for detailed logs, or try a different repository.`;
        
        throw new Error(errorMsg);
      }
      
      const repositoryData: RepositoryData = {
        owner,
        repo,
        url: repoUrl,
        chunks,
        embeddings
      };
      
      this.repositories.set(repoKey, repositoryData);
      console.log(`Successfully ingested ${chunks.length} chunks from ${repoKey}`);
      
      return repositoryData;
    } catch (error) {
      console.error(`Failed to ingest repository ${repoKey}:`, error);
      throw error;
    }
  }

  // Find most relevant chunks for a query
  async findRelevantChunks(repoUrl: string, query: string, topK = 8): Promise<FileChunk[]> {
    console.log(`🔍 Finding relevant chunks for query: "${query}"`);
    
    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    const repoKey = `${owner}/${repo}`;
    
    const repositoryData = this.repositories.get(repoKey);
    if (!repositoryData) {
      console.error(`❌ Repository ${repoKey} not found in memory`);
      throw new Error('Repository not ingested. Please ingest the repository first.');
    }
    
    console.log(`📊 Repository has ${repositoryData.chunks.length} chunks and ${repositoryData.embeddings.size} embeddings`);
    
    // Generate embedding for query
    console.log(`🧠 Generating embedding for query...`);
    const queryEmbedding = await this.generateEmbedding(query);
    console.log(`✅ Query embedding generated: ${queryEmbedding.length} dimensions`);
    
    // Calculate similarities
    const similarities: { chunk: FileChunk; similarity: number }[] = [];
    
    console.log(`🔢 Calculating similarities for ${repositoryData.chunks.length} chunks...`);
    for (const chunk of repositoryData.chunks) {
      const chunkEmbedding = repositoryData.embeddings.get(chunk.id);
      if (chunkEmbedding) {
        try {
          // Validate embedding dimensions
          if (queryEmbedding.length !== chunkEmbedding.length) {
            console.warn(`⚠️ Dimension mismatch for chunk ${chunk.id}: query=${queryEmbedding.length}, chunk=${chunkEmbedding.length}`);
            continue;
          }
          
          const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
          
          // Validate similarity result
          if (isNaN(similarity) || !isFinite(similarity)) {
            console.warn(`⚠️ Invalid similarity result for chunk ${chunk.id}: ${similarity}`);
            continue;
          }
          
          similarities.push({ chunk, similarity });
        } catch (simError) {
          console.warn(`⚠️ Similarity calculation failed for chunk ${chunk.id}:`, simError);
        }
      } else {
        console.warn(`⚠️ No embedding found for chunk ${chunk.id}`);
      }
    }
    
    console.log(`📈 Calculated ${similarities.length} similarities`);
    
    // Sort by similarity and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topChunks = similarities.slice(0, topK);
    
    console.log(`🎯 Top ${topK} relevant chunks:`);
    topChunks.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.chunk.filePath} (similarity: ${item.similarity.toFixed(4)})`);
    });
    
    return topChunks.map(s => s.chunk);
  }

  // Generate chat response using Claude
  async generateResponse(
    repoUrl: string, 
    query: string, 
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    console.log(`🤖 Generating response for query: "${query}"`);
    
    try {
      // Find relevant chunks
      console.log(`🔍 Step 1: Finding relevant chunks...`);
      const relevantChunks = await this.findRelevantChunks(repoUrl, query);
      console.log(`✅ Found ${relevantChunks.length} relevant chunks`);
      
      // Build context from relevant chunks
      console.log(`📝 Step 2: Building context from chunks...`);
      const context = relevantChunks
        .map(chunk => `File: ${chunk.filePath} (lines ${chunk.startLine}-${chunk.endLine})\n\`\`\`\n${chunk.content}\n\`\`\``)
        .join('\n\n');
      
      console.log(`📄 Context built: ${context.length} characters`);
      
      // Build conversation context
      console.log(`💬 Step 3: Building conversation context...`);
      const conversationContext = conversationHistory
        .slice(-4) // Last 4 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      console.log(`🗣️ Conversation context: ${conversationContext.length} characters`);
      
      // Create prompt
      const prompt = `You are a helpful AI assistant analyzing a GitHub repository. Use the provided code context to answer the user's question accurately and cite specific file paths when referencing code.

Repository Context:
${context}

${conversationContext ? `Previous Conversation:\n${conversationContext}\n` : ''}

User Question: ${query}

Please provide a helpful response that:
1. Answers the question based on the repository context
2. Cites specific file paths when referencing code (e.g., "In src/components/App.tsx")
3. Provides code examples when relevant
4. Is formatted in clear markdown

Response:`;

      console.log(`🧠 Step 4: Calling Claude API via backend proxy...`);
      console.log(`📊 Prompt length: ${prompt.length} characters`);

      // Call our local backend proxy
      const response = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          maxTokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Backend proxy error: ${response.status}`, errorData);
        throw new Error(`Backend proxy error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.success && data.response) {
        console.log(`✅ Generated response: ${data.response.length} characters`);
        return data.response;
      } else {
        console.error(`❌ Backend proxy error:`, data);
        throw new Error(`Backend proxy error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error generating response:', error);
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error(`❌ Error name: ${error.name}`);
        console.error(`❌ Error message: ${error.message}`);
        console.error(`❌ Error stack: ${error.stack}`);
      }
      
      // If it's an API error, log more details
      if (error && typeof error === 'object' && 'status' in error) {
        console.error(`❌ API Error status: ${(error as any).status}`);
        console.error(`❌ API Error details:`, (error as any).error || error);
      }
      
      return 'Sorry, there was an error generating a response. Please try again.';
    }
  }

  // Check if repository is ingested
  isRepositoryIngested(repoUrl: string): boolean {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    return this.repositories.has(`${owner}/${repo}`);
  }

  // Get repository info
  getRepositoryInfo(repoUrl: string): RepositoryData | null {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    return this.repositories.get(`${owner}/${repo}`) || null;
  }
}

export const ragService = new RAGService();