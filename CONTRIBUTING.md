# Contributing to Name2Face App

Thank you for your interest in contributing to the Name2Face app! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/app.git
   cd app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up Firebase** following the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/` - New features (e.g., `feature/photo-upload`)
- `fix/` - Bug fixes (e.g., `fix/search-crash`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/search-service`)
- `test/` - Test additions/updates (e.g., `test/add-person-screen`)

### Making Changes

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Write or update tests** for your changes:
   ```bash
   npm test
   ```

4. **Verify TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

5. **Test on platforms** (if possible):
   - Web: `npm run web`
   - iOS: `npm run ios` (requires Mac)
   - Android: `npm run android`

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Add photo upload functionality"
   ```

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: Add voice-to-text for memory hooks
fix: Resolve search crash on empty query
docs: Update Firebase setup instructions
test: Add tests for person service
```

### Pull Request Process

1. **Update documentation** if needed
2. **Ensure all tests pass**: `npm test`
3. **Verify TypeScript compilation**: `npx tsc --noEmit`
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** on GitHub
6. **Fill in the PR template** with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define types/interfaces for data structures
- Avoid `any` types when possible
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

Example:
```typescript
interface MyComponentProps {
  name: string;
  onPress: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ name, onPress }) => {
  // Component implementation
};
```

### File Organization

- One component per file
- Co-locate tests with source files when appropriate
- Group related functionality in directories
- Use index files for clean imports

### Styling

- Use React Native `StyleSheet` API
- Follow existing color scheme (see `src/utils/constants.ts`)
- Ensure responsive design for web
- Test UI on different screen sizes

## Testing Guidelines

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Aim for meaningful test coverage
- Test both success and error cases

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run specific test file
npm test -- validation.test.ts
```

## Platform-Specific Considerations

### Native (iOS/Android)

- Test offline functionality
- Verify Firebase persistence works
- Test FlexSearch integration
- Check native-only features

### Web

- Test online-only behavior
- Verify web-specific UI adaptations
- Test with different browsers
- Check responsive design

## Common Issues

### Firebase Not Initialized

- Ensure `.env` file is properly configured
- Check Firebase services are enabled
- Restart development server

### Tests Failing

- Run `npm install` to ensure dependencies are up-to-date
- Clear Jest cache: `npx jest --clearCache`
- Check for platform-specific issues

### TypeScript Errors

- Run `npx tsc --noEmit` to see all errors
- Check type definitions are installed
- Verify import paths are correct

## Questions or Problems?

- Check existing [GitHub Issues](https://github.com/name2face/app/issues)
- Create a new issue if your question isn't answered
- Provide as much context as possible

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the code, not the person

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

Thank you for contributing to Name2Face! 🎉
