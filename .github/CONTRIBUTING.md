# Contributing to AI Portfolio Project

Thank you for your interest in contributing to the AI Portfolio Project! We welcome contributions from everyone. This document provides guidelines and information for contributors.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, browser, Node.js version, etc.)
- Screenshots if applicable

### Suggesting Features

Feature requests are welcome! Please create an issue with:
- A clear, descriptive title
- Detailed description of the proposed feature
- Why this feature would be useful
- Any relevant mockups or examples

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run tests and ensure code quality
5. Update documentation if needed
6. Submit a pull request with a clear description

## Development Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-portfolio.git
   cd ai-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key

4. Run the development server:
   ```bash
   npm run dev
   ```

## Coding Standards

### TypeScript/React Guidelines

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

### Commit Messages

Use clear, descriptive commit messages following this format:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test across different browsers if applicable

## Project Structure

```
src/
├── components/     # React components
├── utils/         # Utility functions
├── types.ts       # TypeScript type definitions
└── App.tsx        # Main application component
```

## Getting Help

If you need help or have questions:
- Check existing issues and documentation
- Join our community discussions
- Contact the maintainers

Thank you for contributing to make this project better!