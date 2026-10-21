# ChurchManager — Estratégia e Execução de Testes

Guia de execução, padrões e cobertura de testes automatizados do frontend.

---

## 1. Ferramental de Testes

- **Test Runner**: Vitest 2+ / 3+
- **Ambiente DOM**: `jsdom`
- **Renderização e Asserções**: `@testing-library/react` + `@testing-library/jest-dom`
- **Simulação de Ações do Usuário**: `@testing-library/user-event`
- **Mock de API**: `DevMockAdapter` com fixtures tipadas

---

## 2. Comandos de Execução

```bash
# Executar todos os testes uma vez
npm run test

# Executar testes em modo observador (watch)
npm run test:watch

# Checagem de tipagem estrita
npm run typecheck

# Análise estática com ESLint
npm run lint
```

---

## 3. Diretrizes de Qualidade

1. **Evidência Obrigatória**: Nenhuma etapa é declarada concluída sem execução real e aprovação de 100% dos testes.
2. **Sem Simulações Falsas**: Testes validam comportamentos observáveis do usuário (textos, botões, acessibilidade), não detalhes privados de implementação.
