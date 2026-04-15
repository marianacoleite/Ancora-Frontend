/**
 * Contrato da API consumido pelo frontend — reexporta tipos e caminhos para o backend
 * (TypeScript) copiar este ficheiro ou importar via `ancora-frontend/contracts`.
 */

export type {
  TaskStatus,
  Workspace,
  Subspace,
  Section,
  Task,
  AppData,
} from '../src/types/models'

export type {
  ApiAuthUser,
  ApiAuthResponse,
  ApiAppDataResponse,
  CreateWorkspaceBody,
  PatchWorkspaceBody,
  CreateSubspaceBody,
  PatchSubspaceBody,
  CreateSectionBody,
  PatchSectionBody,
  CreateTaskBody,
  PatchTaskBody,
} from '../src/services/api/types'

export { paths } from '../src/services/api/routes'

/** Prefixo REST relativo à URL base (`{VITE_BACKEND_URL}/api/v1/...`). */
export const API_PREFIX = '/api/v1' as const
