import React from "react";

interface TechIconProps {
  name: string;
  className?: string;
}

export const TechIcon: React.FC<TechIconProps> = ({
  name,
  className = "w-4 h-4",
}) => {
  const normalize = (s: string) => s.toLowerCase().trim();
  const n = normalize(name);

  const getLogoUrl = (techName: string) => {
    const map: Record<string, string> = {
      "c#": "csharp.com",
      ".net": "dotnet.microsoft.com",
      "c++": "isocpp.org",
      next: "nextjs.org",
      "next.js": "nextjs.org",
      node: "nodejs.org",
      "node.js": "nodejs.org",
      react: "react.dev",
      "react.js": "react.dev",
      vue: "vuejs.org",
      "vue.js": "vuejs.org",
      aws: "aws.amazon.com",
      angular: "angular.io",
      mongo: "mongodb.com",
      mongodb: "mongodb.com",
      postgres: "postgresql.org",
      postgresql: "postgresql.org",
      mysql: "mysql.com",
      redis: "redis.io",
      docker: "docker.com",
      kubernetes: "kubernetes.io",
      git: "git-scm.com",
      github: "github.com",
      gitlab: "gitlab.com",
      python: "python.org",
      django: "djangoproject.com",
      flask: "palletsprojects.com",
      fastapi: "fastapi.tiangolo.com",
      java: "java.com",
      spring: "spring.io",
      kotlin: "kotlinlang.org",
      swift: "swift.org",
      go: "go.dev",
      golang: "go.dev",
      rust: "rust-lang.org",
      ruby: "ruby-lang.org",
      rails: "rubyonrails.org",
      php: "php.net",
      laravel: "laravel.com",
      typescript: "typescriptlang.org",
      javascript: "javascript.com", // si prefieres: "js.org"
      html: "w3.org",
      css: "w3.org",
      sass: "sass-lang.com",
      tailwind: "tailwindcss.com",
      bootstrap: "getbootstrap.com",
      figma: "figma.com",
      jira: "atlassian.com",
      trello: "trello.com",
      slack: "slack.com",
      vscode: "code.visualstudio.com",
      intellij: "jetbrains.com",
      postman: "postman.com",
    };

    let domain = map[techName.toLowerCase()];

    if (!domain) {
      const clean = techName.toLowerCase().replace(/\s+/g, "");
      domain = clean.includes(".") ? clean : `${clean}.com`;
    }

    const token = "pk_PnQ8GRcqQDK4cwvIP4rxuQ";
    return `https://img.logo.dev/${domain}?token=${token}`;
  };

  return (
    <img
      src={getLogoUrl(n)}
      alt={name}
      className={`${className} object-contain opacity-80 hover:opacity-100 transition-opacity`}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
};
