/**
 * Script de inicialização do MongoDB para o Organizador de Abas
 * Este script cria os índices e popula dados de demonstração iniciais.
 */

db = db.getSiblingDB("organizador_abas");

// Criar coleções
db.createCollection("groups");
db.createCollection("pages");

// Criar índices para performance e unicidade
db.groups.createIndex({ id: 1 }, { unique: true });
db.groups.createIndex({ createdAt: 1 });

db.pages.createIndex({ id: 1 }, { unique: true });
db.pages.createIndex({ groupId: 1 });
db.pages.createIndex({ isFavorite: 1 });
db.pages.createIndex({ createdAt: -1 });

// Inserir grupos iniciais se a coleção estiver vazia
if (db.groups.countDocuments() === 0) {
  const now = Date.now();
  db.groups.insertMany([
    {
      id: "grp_devops",
      name: "DevOps & Cloud",
      emoji: "☁️",
      color: "#5b7082",
      createdAt: new Date(now - 86400000 * 5).toISOString(),
    },
    {
      id: "grp_dev",
      name: "Desenvolvimento",
      emoji: "💻",
      color: "#c86446",
      createdAt: new Date(now - 86400000 * 4).toISOString(),
    },
    {
      id: "grp_leitura",
      name: "Leituras & Artigos",
      emoji: "📚",
      color: "#d4a373",
      createdAt: new Date(now - 86400000 * 3).toISOString(),
    },
    {
      id: "grp_tools",
      name: "Ferramentas & IA",
      emoji: "⚡",
      color: "#819875",
      createdAt: new Date(now - 86400000 * 2).toISOString(),
    },
  ]);
  print("Grupos iniciais inseridos com sucesso.");
}

// Inserir páginas iniciais se a coleção estiver vazia
if (db.pages.countDocuments() === 0) {
  const now = Date.now();
  db.pages.insertMany([
    {
      id: "pg_1",
      url: "https://docs.docker.com/get-started/",
      title: "Docker Get Started & Container Architecture",
      domain: "docs.docker.com",
      favicon: "https://www.google.com/s2/favicons?domain=docs.docker.com&sz=64",
      groupId: "grp_devops",
      notes: "Documentação base para padronizar Dockerfiles e compose.",
      isFavorite: true,
      createdAt: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: "pg_2",
      url: "https://kubernetes.io/docs/concepts/overview/",
      title: "Kubernetes Concepts Overview",
      domain: "kubernetes.io",
      favicon: "https://www.google.com/s2/favicons?domain=kubernetes.io&sz=64",
      groupId: "grp_devops",
      notes: "Consultar especificações de Pods e Services.",
      isFavorite: false,
      createdAt: new Date(now - 86400000 * 1).toISOString(),
    },
    {
      id: "pg_3",
      url: "https://nextjs.org/docs",
      title: "Next.js App Router Documentation",
      domain: "nextjs.org",
      favicon: "https://www.google.com/s2/favicons?domain=nextjs.org&sz=64",
      groupId: "grp_dev",
      notes: "Novas convenções de rotas dinâmicas e Server Actions.",
      isFavorite: true,
      createdAt: new Date(now - 3600000 * 12).toISOString(),
    },
    {
      id: "pg_4",
      url: "https://tanstack.com/query/latest/docs/framework/react/overview",
      title: "TanStack Query Overview & Optimistic Updates",
      domain: "tanstack.com",
      favicon: "https://www.google.com/s2/favicons?domain=tanstack.com&sz=64",
      groupId: "grp_dev",
      notes: "Exemplos práticos de mutações com rollback.",
      isFavorite: false,
      createdAt: new Date(now - 3600000 * 8).toISOString(),
    },
    {
      id: "pg_5",
      url: "https://n8n.io/workflows/",
      title: "n8n Workflow Automation Templates",
      domain: "n8n.io",
      favicon: "https://www.google.com/s2/favicons?domain=n8n.io&sz=64",
      groupId: "grp_tools",
      notes: "Modelos de webhooks prontos para integração com MongoDB.",
      isFavorite: true,
      createdAt: new Date(now - 3600000 * 4).toISOString(),
    },
    {
      id: "pg_6",
      url: "https://martinfowler.com/articles/microservices.html",
      title: "Microservices Guide by Martin Fowler",
      domain: "martinfowler.com",
      favicon: "https://www.google.com/s2/favicons?domain=martinfowler.com&sz=64",
      groupId: "grp_leitura",
      notes: "Artigo clássico sobre fronteiras de contexto e desacoplamento.",
      isFavorite: false,
      createdAt: new Date(now - 3600000 * 2).toISOString(),
    },
    {
      id: "pg_7",
      url: "https://github.com/trending",
      title: "Trending repositories on GitHub today",
      domain: "github.com",
      favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
      groupId: null,
      notes: "Revisar repositórios de frontend interessantes.",
      isFavorite: false,
      createdAt: new Date(now - 1800000).toISOString(),
    },
  ]);
  print("Páginas iniciais inseridas com sucesso.");
}
