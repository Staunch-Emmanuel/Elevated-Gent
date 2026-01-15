import 'server-only'
import admin, { type ServiceAccount } from 'firebase-admin'

function cleanEnvValue(v?: string) {
  if (!v) return undefined
  // remove wrapping quotes if present
  const trimmed = v.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseServiceAccount(): ServiceAccount {
  const jsonRaw = cleanEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  const projectId = cleanEnvValue(process.env.FIREBASE_PROJECT_ID)
  const clientEmail = cleanEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL)
  const privateKeyRaw = cleanEnvValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY)

  // Preferred: full JSON service account in FIREBASE_SERVICE_ACCOUNT_KEY
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw) as ServiceAccount
      if (!parsed.projectId && projectId) parsed.projectId = projectId
      if (parsed.privateKey) {
        parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n')
      }
      return parsed
    } catch (e) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON. Fix your .env.local value.'
      )
    }
  }

  // Fallback: split vars
  if (!projectId) throw new Error('Missing FIREBASE_PROJECT_ID in environment.')
  if (!clientEmail) throw new Error('Missing FIREBASE_ADMIN_CLIENT_EMAIL in environment.')
  if (!privateKeyRaw) throw new Error('Missing FIREBASE_ADMIN_PRIVATE_KEY in environment.')

  return {
    projectId,
    clientEmail,
    privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
  } as ServiceAccount
}

if (!admin.apps.length) {
  const serviceAccount = parseServiceAccount()
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
