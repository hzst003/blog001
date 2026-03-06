// This file is auto-generated. Do not edit manually.
import { Post } from '@/types/post';

export const postsConfig = {
  "title": "Blog Posts",
  "description": "Technical articles, tutorials, and insights about web development and EdgeOne platform.",
  "backButton": "Back to Home",
  "noPosts": "No posts found matching your search.",
  "searchPlaceholder": "Search posts by title...",
  "pagination": {
    "previous": "Previous",
    "next": "Next"
  },
  "posts": [
    {
      "title": "Hello World",
      "description": "第一篇博客文章，欢迎来到我的博客",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post1.jpg",
      "slug": "posts/helloworld",
      "tags": [
        "hello",
        "intro",
        "getting started"
      ],
      "author": "Blog Author",
      "readTime": "5",
      "content": "\r\n# Hello World\r\n\r\n欢迎来到我的博客！这是第一篇文章。\r\n\r\n## 关于这篇文章\r\n\r\n这是一篇简单的 Hello World 文章，用来开始你的博客之旅。\r\n\r\n## 接下来\r\n\r\n- 探索更多文章\r\n- 学习新技术\r\n- 分享你的想法\r\n\r\n感谢阅读！\r\n",
      "html": "<h1>Hello World</h1>\n<p>欢迎来到我的博客！这是第一篇文章。</p>\n<h2>关于这篇文章</h2>\n<p>这是一篇简单的 Hello World 文章，用来开始你的博客之旅。</p>\n<h2>接下来</h2>\n<ul>\n<li>探索更多文章</li>\n<li>学习新技术</li>\n<li>分享你的想法</li>\n</ul>\n<p>感谢阅读！</p>\n"
    },
    {
      "title": "My Blog Journey",
      "description": "A personal journey of learning and growth in web development",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post1.jpg",
      "slug": "posts/mcp-template-list",
      "tags": [
        "web development",
        "learning",
        "personal"
      ],
      "author": "John Doe",
      "readTime": "5",
      "content": "\r\n# My Blog Journey\r\n\r\nWelcome to my personal blog where I share my experiences and insights about web development. This is a space where I document my learning journey and share knowledge with others.\r\n\r\n## What I've Learned\r\n\r\n- Modern web development practices\r\n- Frontend frameworks and tools\r\n- Backend technologies\r\n- Best practices and tips\r\n\r\n## Getting Started\r\n\r\n```bash\r\nnpm install\r\nnpm run dev\r\n```\r\n\r\n## About This Blog\r\n\r\nThis blog is built using modern web technologies and follows best practices in web development. Feel free to explore and learn from my experiences.\r\n",
      "html": "<h1>My Blog Journey</h1>\n<p>Welcome to my personal blog where I share my experiences and insights about web development. This is a space where I document my learning journey and share knowledge with others.</p>\n<h2>What I&#39;ve Learned</h2>\n<ul>\n<li>Modern web development practices</li>\n<li>Frontend frameworks and tools</li>\n<li>Backend technologies</li>\n<li>Best practices and tips</li>\n</ul>\n<h2>Getting Started</h2>\n<pre><code class=\"language-bash\">npm install\nnpm run dev\n</code></pre>\n<h2>About This Blog</h2>\n<p>This blog is built using modern web technologies and follows best practices in web development. Feel free to explore and learn from my experiences.</p>\n"
    },
    {
      "title": "Building Microservices with Node.js",
      "description": "A practical guide to building scalable microservices using Node.js",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post2.jpg",
      "slug": "posts/nodejs-microservices",
      "tags": [
        "nodejs",
        "microservices",
        "backend",
        "architecture"
      ],
      "author": "David Brown",
      "readTime": "5",
      "content": "\r\n# Building Microservices with Node.js\r\n\r\nMicroservices architecture has become a popular approach for building scalable applications. Let's explore how to implement it using Node.js.\r\n\r\n## Architecture Overview\r\n\r\n- Service Discovery\r\n- API Gateway\r\n- Message Queues\r\n- Containerization\r\n\r\n## Implementation Example\r\n\r\n```javascript\r\n// Example of a microservice using Express\r\nconst express = require(\"express\");\r\nconst app = express();\r\n\r\napp.get(\"/api/users\", async (req, res) => {\r\n  try {\r\n    const users = await userService.getAllUsers();\r\n    res.json(users);\r\n  } catch (error) {\r\n    res.status(500).json({ error: error.message });\r\n  }\r\n});\r\n\r\n// Service registration\r\nconst serviceRegistry = {\r\n  register: (service) => {\r\n    // Implementation\r\n  },\r\n};\r\n```\r\n\r\n## Best Practices\r\n\r\n1. Use containerization\r\n2. Implement circuit breakers\r\n3. Handle service discovery\r\n4. Monitor service health\r\n",
      "html": "<h1>Building Microservices with Node.js</h1>\n<p>Microservices architecture has become a popular approach for building scalable applications. Let&#39;s explore how to implement it using Node.js.</p>\n<h2>Architecture Overview</h2>\n<ul>\n<li>Service Discovery</li>\n<li>API Gateway</li>\n<li>Message Queues</li>\n<li>Containerization</li>\n</ul>\n<h2>Implementation Example</h2>\n<pre><code class=\"language-javascript\">// Example of a microservice using Express\nconst express = require(&quot;express&quot;);\nconst app = express();\n\napp.get(&quot;/api/users&quot;, async (req, res) =&gt; {\n  try {\n    const users = await userService.getAllUsers();\n    res.json(users);\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n\n// Service registration\nconst serviceRegistry = {\n  register: (service) =&gt; {\n    // Implementation\n  },\n};\n</code></pre>\n<h2>Best Practices</h2>\n<ol>\n<li>Use containerization</li>\n<li>Implement circuit breakers</li>\n<li>Handle service discovery</li>\n<li>Monitor service health</li>\n</ol>\n"
    },
    {
      "title": "React Performance Optimization Techniques",
      "description": "Learn how to optimize your React applications for better performance",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post3.jpg",
      "slug": "posts/react-performance",
      "tags": [
        "react",
        "performance",
        "optimization",
        "frontend"
      ],
      "author": "Mike Chen",
      "readTime": "5",
      "content": "\r\n# React Performance Optimization Techniques\r\n\r\nPerformance optimization is crucial for delivering a smooth user experience. Let's explore various techniques to optimize React applications.\r\n\r\n## Key Optimization Areas\r\n\r\n- Component Memoization\r\n- Code Splitting\r\n- Virtual Lists\r\n- State Management\r\n\r\n## Code Examples\r\n\r\n```jsx\r\n// Using React.memo for component memoization\r\nconst MemoizedComponent = React.memo(({ data }) => {\r\n  return (\r\n    <div>\r\n      {data.map((item) => (\r\n        <Item key={item.id} {...item} />\r\n      ))}\r\n    </div>\r\n  );\r\n});\r\n\r\n// Using useMemo for expensive calculations\r\nconst memoizedValue = useMemo(() => {\r\n  return computeExpensiveValue(a, b);\r\n}, [a, b]);\r\n```\r\n\r\n## Best Practices\r\n\r\n1. Use React.memo for pure components\r\n2. Implement proper code splitting\r\n3. Optimize re-renders\r\n4. Use proper key props\r\n",
      "html": "<h1>React Performance Optimization Techniques</h1>\n<p>Performance optimization is crucial for delivering a smooth user experience. Let&#39;s explore various techniques to optimize React applications.</p>\n<h2>Key Optimization Areas</h2>\n<ul>\n<li>Component Memoization</li>\n<li>Code Splitting</li>\n<li>Virtual Lists</li>\n<li>State Management</li>\n</ul>\n<h2>Code Examples</h2>\n<pre><code class=\"language-jsx\">// Using React.memo for component memoization\nconst MemoizedComponent = React.memo(({ data }) =&gt; {\n  return (\n    &lt;div&gt;\n      {data.map((item) =&gt; (\n        &lt;Item key={item.id} {...item} /&gt;\n      ))}\n    &lt;/div&gt;\n  );\n});\n\n// Using useMemo for expensive calculations\nconst memoizedValue = useMemo(() =&gt; {\n  return computeExpensiveValue(a, b);\n}, [a, b]);\n</code></pre>\n<h2>Best Practices</h2>\n<ol>\n<li>Use React.memo for pure components</li>\n<li>Implement proper code splitting</li>\n<li>Optimize re-renders</li>\n<li>Use proper key props</li>\n</ol>\n"
    },
    {
      "title": "Web Security Best Practices",
      "description": "Essential security practices for modern web applications",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post1.jpg",
      "slug": "posts/security-best-practices",
      "tags": [
        "security",
        "web development",
        "best practices",
        "authentication"
      ],
      "author": "John Security",
      "readTime": "5",
      "content": "\r\n# Web Security Best Practices\r\n\r\nSecurity is crucial for any web application. Let's explore essential security practices to protect your applications.\r\n\r\n## Key Security Areas\r\n\r\n- Authentication\r\n- Authorization\r\n- Data Encryption\r\n- Input Validation\r\n\r\n## Implementation Examples\r\n\r\n```javascript\r\n// Example of secure password hashing\r\nconst bcrypt = require(\"bcrypt\");\r\n\r\nasync function hashPassword(password) {\r\n  const salt = await bcrypt.genSalt(12);\r\n  return bcrypt.hash(password, salt);\r\n}\r\n\r\n// Example of JWT implementation\r\nconst jwt = require(\"jsonwebtoken\");\r\n\r\nfunction generateToken(user) {\r\n  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {\r\n    expiresIn: \"1h\",\r\n  });\r\n}\r\n```\r\n\r\n## Security Checklist\r\n\r\n1. Use HTTPS\r\n2. Implement proper authentication\r\n3. Sanitize user input\r\n4. Use secure headers\r\n5. Regular security audits\r\n",
      "html": "<h1>Web Security Best Practices</h1>\n<p>Security is crucial for any web application. Let&#39;s explore essential security practices to protect your applications.</p>\n<h2>Key Security Areas</h2>\n<ul>\n<li>Authentication</li>\n<li>Authorization</li>\n<li>Data Encryption</li>\n<li>Input Validation</li>\n</ul>\n<h2>Implementation Examples</h2>\n<pre><code class=\"language-javascript\">// Example of secure password hashing\nconst bcrypt = require(&quot;bcrypt&quot;);\n\nasync function hashPassword(password) {\n  const salt = await bcrypt.genSalt(12);\n  return bcrypt.hash(password, salt);\n}\n\n// Example of JWT implementation\nconst jwt = require(&quot;jsonwebtoken&quot;);\n\nfunction generateToken(user) {\n  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {\n    expiresIn: &quot;1h&quot;,\n  });\n}\n</code></pre>\n<h2>Security Checklist</h2>\n<ol>\n<li>Use HTTPS</li>\n<li>Implement proper authentication</li>\n<li>Sanitize user input</li>\n<li>Use secure headers</li>\n<li>Regular security audits</li>\n</ol>\n"
    },
    {
      "title": "Advanced Tailwind CSS Tips and Tricks",
      "description": "Learn how to leverage Tailwind CSS for better UI development",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post2.jpg",
      "slug": "posts/tailwind-css-tips",
      "tags": [
        "css",
        "tailwind",
        "frontend",
        "design"
      ],
      "author": "Sarah Wilson",
      "readTime": "5",
      "content": "\r\n# Advanced Tailwind CSS Tips and Tricks\r\n\r\nTailwind CSS has revolutionized how we build user interfaces. Here are some advanced tips to help you get the most out of this utility-first CSS framework.\r\n\r\n## Custom Configuration\r\n\r\n```javascript\r\n// tailwind.config.js\r\nmodule.exports = {\r\n  theme: {\r\n    extend: {\r\n      colors: {\r\n        primary: \"#1a73e8\",\r\n        secondary: \"#34a853\",\r\n      },\r\n    },\r\n  },\r\n};\r\n```\r\n\r\n## Best Practices\r\n\r\n1. Use @apply for repeated patterns\r\n2. Leverage custom plugins\r\n3. Optimize for production\r\n4. Use arbitrary values when needed\r\n\r\n## Component Examples\r\n\r\n```html\r\n<div\r\n  class=\"flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm\"\r\n>\r\n  <h2 class=\"text-xl font-semibold text-gray-900 dark:text-white\">\r\n    Card Title\r\n  </h2>\r\n  <button\r\n    class=\"px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark\"\r\n  >\r\n    Click Me\r\n  </button>\r\n</div>\r\n```\r\n",
      "html": "<h1>Advanced Tailwind CSS Tips and Tricks</h1>\n<p>Tailwind CSS has revolutionized how we build user interfaces. Here are some advanced tips to help you get the most out of this utility-first CSS framework.</p>\n<h2>Custom Configuration</h2>\n<pre><code class=\"language-javascript\">// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: &quot;#1a73e8&quot;,\n        secondary: &quot;#34a853&quot;,\n      },\n    },\n  },\n};\n</code></pre>\n<h2>Best Practices</h2>\n<ol>\n<li>Use @apply for repeated patterns</li>\n<li>Leverage custom plugins</li>\n<li>Optimize for production</li>\n<li>Use arbitrary values when needed</li>\n</ol>\n<h2>Component Examples</h2>\n<pre><code class=\"language-html\">&lt;div\n  class=&quot;flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm&quot;\n&gt;\n  &lt;h2 class=&quot;text-xl font-semibold text-gray-900 dark:text-white&quot;&gt;\n    Card Title\n  &lt;/h2&gt;\n  &lt;button\n    class=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark&quot;\n  &gt;\n    Click Me\n  &lt;/button&gt;\n&lt;/div&gt;\n</code></pre>\n"
    },
    {
      "title": "Testing React Applications",
      "description": "A comprehensive guide to testing React applications with Jest and React Testing Library",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post3.jpg",
      "slug": "posts/testing-react",
      "tags": [
        "react",
        "testing",
        "jest",
        "frontend"
      ],
      "author": "Emma Davis",
      "readTime": "5",
      "content": "\r\n# Testing React Applications\r\n\r\nTesting is crucial for maintaining high-quality React applications. Let's explore different testing strategies and tools.\r\n\r\n## Testing Tools\r\n\r\n- Jest\r\n- React Testing Library\r\n- Cypress\r\n- MSW (Mock Service Worker)\r\n\r\n## Example Tests\r\n\r\n```jsx\r\nimport { render, screen, fireEvent } from \"@testing-library/react\";\r\nimport userEvent from \"@testing-library/user-event\";\r\nimport Counter from \"./Counter\";\r\n\r\ndescribe(\"Counter\", () => {\r\n  test(\"renders counter with initial value\", () => {\r\n    render(<Counter />);\r\n    expect(screen.getByText(\"Count: 0\")).toBeInTheDocument();\r\n  });\r\n\r\n  test(\"increments counter when button is clicked\", async () => {\r\n    render(<Counter />);\r\n    const button = screen.getByRole(\"button\", { name: /increment/i });\r\n    await userEvent.click(button);\r\n    expect(screen.getByText(\"Count: 1\")).toBeInTheDocument();\r\n  });\r\n});\r\n```\r\n\r\n## Testing Strategies\r\n\r\n1. Unit Testing\r\n2. Integration Testing\r\n3. End-to-End Testing\r\n4. Snapshot Testing\r\n",
      "html": "<h1>Testing React Applications</h1>\n<p>Testing is crucial for maintaining high-quality React applications. Let&#39;s explore different testing strategies and tools.</p>\n<h2>Testing Tools</h2>\n<ul>\n<li>Jest</li>\n<li>React Testing Library</li>\n<li>Cypress</li>\n<li>MSW (Mock Service Worker)</li>\n</ul>\n<h2>Example Tests</h2>\n<pre><code class=\"language-jsx\">import { render, screen, fireEvent } from &quot;@testing-library/react&quot;;\nimport userEvent from &quot;@testing-library/user-event&quot;;\nimport Counter from &quot;./Counter&quot;;\n\ndescribe(&quot;Counter&quot;, () =&gt; {\n  test(&quot;renders counter with initial value&quot;, () =&gt; {\n    render(&lt;Counter /&gt;);\n    expect(screen.getByText(&quot;Count: 0&quot;)).toBeInTheDocument();\n  });\n\n  test(&quot;increments counter when button is clicked&quot;, async () =&gt; {\n    render(&lt;Counter /&gt;);\n    const button = screen.getByRole(&quot;button&quot;, { name: /increment/i });\n    await userEvent.click(button);\n    expect(screen.getByText(&quot;Count: 1&quot;)).toBeInTheDocument();\n  });\n});\n</code></pre>\n<h2>Testing Strategies</h2>\n<ol>\n<li>Unit Testing</li>\n<li>Integration Testing</li>\n<li>End-to-End Testing</li>\n<li>Snapshot Testing</li>\n</ol>\n"
    },
    {
      "title": "TypeScript Best Practices in 2024",
      "description": "Essential TypeScript patterns and practices for modern web development",
      "date": "2024-03-20",
      "image": "/assets/images/posts/post1.jpg",
      "slug": "posts/typescript-best-practices",
      "tags": [
        "typescript",
        "javascript",
        "programming",
        "best practices"
      ],
      "author": "Alex Johnson",
      "readTime": "5",
      "content": "\r\n# TypeScript Best Practices in 2024\r\n\r\nTypeScript has become an essential tool in modern web development. Let's explore the best practices that will help you write more maintainable and type-safe code.\r\n\r\n## Type Safety\r\n\r\n- Use strict mode\r\n- Leverage type inference\r\n- Define proper interfaces\r\n- Use type guards effectively\r\n\r\n## Code Organization\r\n\r\n```typescript\r\n// Example of a well-organized TypeScript module\r\ninterface User {\r\n  id: string;\r\n  name: string;\r\n  email: string;\r\n}\r\n\r\nclass UserService {\r\n  async getUser(id: string): Promise<User> {\r\n    // Implementation\r\n  }\r\n}\r\n```\r\n\r\n## Advanced Features\r\n\r\n1. Generics\r\n2. Utility Types\r\n3. Decorators\r\n4. Type Guards\r\n",
      "html": "<h1>TypeScript Best Practices in 2024</h1>\n<p>TypeScript has become an essential tool in modern web development. Let&#39;s explore the best practices that will help you write more maintainable and type-safe code.</p>\n<h2>Type Safety</h2>\n<ul>\n<li>Use strict mode</li>\n<li>Leverage type inference</li>\n<li>Define proper interfaces</li>\n<li>Use type guards effectively</li>\n</ul>\n<h2>Code Organization</h2>\n<pre><code class=\"language-typescript\">// Example of a well-organized TypeScript module\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\nclass UserService {\n  async getUser(id: string): Promise&lt;User&gt; {\n    // Implementation\n  }\n}\n</code></pre>\n<h2>Advanced Features</h2>\n<ol>\n<li>Generics</li>\n<li>Utility Types</li>\n<li>Decorators</li>\n<li>Type Guards</li>\n</ol>\n"
    }
  ]
} as const;
