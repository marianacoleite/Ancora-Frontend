/**
 * Caminhos relativos a `{BASE_URL}/api/v1`.
 *
 * Contrato para o backend (corpos em JSON, `Content-Type: application/json`):
 * - `Authorization: Bearer <JWT>` em todas as rotas exceto login/registo.
 *
 * Auth:
 * - POST `/auth/login` body `{ email, password }` → `{ token, user: { id, email } }`
 * - POST `/auth/register` idem
 * - GET `/auth/me` → `{ user: { id, email } }`
 * - POST `/auth/logout` (opcional; pode ser 204)
 *
 * Dados:
 * - GET `/app-data` → `{ workspaces, subspaces, sections, tasks }` (mesmos campos que `src/types/models.ts`)
 * - POST/PATCH/DELETE em `/workspaces`, `/subspaces`, `/sections`, `/tasks` — ver `appDataApi.ts` e `types.ts`
 * - DELETE em workspace/subespaço/secção deve cascatear no servidor (ou devolver erro coerente)
 */

export const paths = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  appData: '/app-data',
  workspaces: '/workspaces',
  subspaces: '/subspaces',
  sections: '/sections',
  tasks: '/tasks',
} as const
