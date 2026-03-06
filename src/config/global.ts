export const globalConfig = {
  site: {
    name: "Your Portfolio Name",
    author: "Your Name",
    description: "A brief description of your portfolio website",
    url: "/"
  },
  navigation: {
    aria: "Main Navigation",
    items: [
      {
        title: "Home",
        href: "/"
      },
      {
        title: "Projects",
        href: "/projects"
      },
      {
        title: "Posts",
        href: "/posts"
      },
      {
        title: "About",
        href: "/about"
      }
    ]
  },
  footer: {
    aria: "Footer Navigation",
    copyright: "© 2025 Your Name. All rights reserved.",
    social: {
      twitter: "https://www.baidu.com",
      github: "https://www.baidu.com/",
      email: "your.email@example.com"
    }
  }
} as const; 