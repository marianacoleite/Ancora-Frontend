# Âncora

**Gerenciador de tarefas pensado para quem desenvolve** — organize trabalho em espaços, subespaços e seções, com visão em lista ou Kanban, arrastar e soltar, e sincronização na nuvem quando você quiser.

---

## Por que usar

- **Hierarquia clara:** espaços de trabalho → subespaços → seções → tarefas.
- **Duas formas de ver o mesmo board:** agrupado (estilo Kanban) ou tabela.
- **Arrastar e soltar** para reordenar e mudar status com fluidez.
- **Dois modos de operação:** demo instantânea no navegador (dados em `localStorage`) ou **backend** com login e API quando `VITE_BACKEND_URL` estiver definido.
- **Interface moderna:** tema claro/escuro, animações leves e feedback com toasts.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 8 |
| Roteamento | React Router 7 |
| Backend opcional | API HTTP (Express) + JWT |
| Drag & drop | dnd-kit |
| Motion | Framer Motion |
| Ícones | Lucide React |

---

## Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20+ (recomendado)
- npm (vem com o Node)

### Instalação

```bash
git clone <url-do-repositório>
cd Ancora-Frontend
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

Abra o endereço que o Vite mostrar no terminal (geralmente `http://localhost:5173`).

### Build de produção

```bash
npm run build
npm run preview   # testa o build localmente
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste.

| Variável | Descrição |
|----------|-----------|
| `VITE_BACKEND_URL` | URL base do backend (Express). Com ela, a app usa `/api/v1` e JWT em `sessionStorage`; sem ela, modo local (`localStorage`). |
| `VITE_USUARIO` | (Opcional) E-mail de login pré-preenchido em desenvolvimento. |
| `VITE_SENHA` | (Opcional) Senha pré-preenchida em desenvolvimento — **não** uses credenciais reais em produção; variáveis `VITE_*` ficam expostas no bundle do cliente. |

Ao arrancar com backend, a app pode fazer `GET /health` e mostrar na barra lateral **Servidor online** ou **inacessível**.

No servidor, o CORS costuma depender de `CORS_ORIGIN`; inclui o origin do Vite (ex.: `http://localhost:5173`).

As funções de API estão em `src/services/api/` (`backend.ts`, `authApi.ts`, etc.).

Reinicie o servidor de desenvolvimento após alterar o `.env`.

> **Dica:** sem `VITE_BACKEND_URL`, o app usa modo demo e o login pode ser ignorado conforme a configuração da aplicação.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Typecheck + bundle otimizado em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

---

## Estrutura (visão geral)

```
src/
  components/     # Layout (sidebar, navbar), UI, tarefas, seções
  contexts/       # Auth e dados da aplicação
  pages/          # Rotas (login, subespaço, redirects)
  services/       # API HTTP, armazenamento local
  types/          # Modelos TypeScript
public/
  favicon.svg
```

---

## Licença

Este repositório é **privado**; ajuste esta seção se publicar o projeto sob uma licença aberta.

---

Feito com foco em clareza e ritmo de trabalho — **fixe o que importa**.
