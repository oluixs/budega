// Nos testes (Vitest/jsdom) não existe a separação servidor/cliente do Next.js, e o
// pacote "server-only" lança erro ao ser importado fora de um Server Component.
// vitest.config.ts aponta "server-only" para este módulo vazio.
export {};
