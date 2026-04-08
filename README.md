# Âncora

**Gerenciador de tarefas pensado para quem desenvolve** — organize trabalho em espaços, subespaços e seções, com visão em lista ou Kanban, arrastar e soltar, e sincronização na nuvem quando você quiser.

---

## Por que usar

- **Hierarquia clara:** espaços de trabalho → subespaços → seções → tarefas.
- **Duas formas de ver o mesmo board:** agrupado (estilo Kanban) ou tabela.
- **Arrastar e soltar** para reordenar e mudar status com fluidez.
- **Dois modos de operação:** demo instantânea no navegador ou **Firebase** (Auth + Firestore) para time e backup na nuvem.
- **Interface moderna:** tema claro/escuro, animações leves e feedback com toasts.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 8 |
| Roteamento | React Router 7 |
| Backend opcional | Firebase (Authentication + Firestore) |
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
cd Lampiao-Frontend
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

## Firebase (opcional)

Sem configuração, o app usa **modo demo**: dados no `localStorage` do navegador, sem login.

Para **conta, login e dados na nuvem**:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative **Authentication** (e-mail/senha) e crie o banco **Firestore**.
3. Copie `.env.example` para `.env.local` e preencha as variáveis do seu app (Project settings → Your apps).

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Reinicie o servidor de desenvolvimento após alterar o `.env.local`.

> **Dica:** com Firebase ativo, a rota `/login` passa a ser usada para entrar ou criar conta. No modo demo, o login é ignorado e você cai direto na aplicação.

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
  services/       # Firebase, API Firestore, armazenamento local
  types/          # Modelos TypeScript
public/
  favicon.svg
```

---

## Licença

Este repositório é **privado**; ajuste esta seção se publicar o projeto sob uma licença aberta.

---

Feito com foco em clareza e ritmo de trabalho — **fixe o que importa**.
