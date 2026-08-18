import { revalidatePath, revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type RevalidatePayload = {
  path?: string
  paths?: string[]
  tag?: string
  tags?: string[]
}

async function readPayload(request: NextRequest): Promise<RevalidatePayload> {
  return request.json().catch(() => ({})) as Promise<{
    path?: string
    paths?: string[]
    tag?: string
    tags?: string[]
  }>
}

function uniqueStrings(values: unknown[], maxLength: number): string[] | null {
  const strings = values.filter((value): value is string => typeof value === 'string')
  if (strings.length !== values.length) return null

  const normalized = Array.from(new Set(strings.map((value) => value.trim()).filter(Boolean)))
  if (normalized.length > 50 || normalized.some((value) => value.length > maxLength)) return null

  return normalized
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: 'Invalid secret' }, { status: 401 })
  }

  const payload = await readPayload(request)
  if (
    (payload.path !== undefined && typeof payload.path !== 'string') ||
    (payload.paths !== undefined && !Array.isArray(payload.paths)) ||
    (payload.tag !== undefined && typeof payload.tag !== 'string') ||
    (payload.tags !== undefined && !Array.isArray(payload.tags))
  ) {
    return Response.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
  }

  const rawPaths = [payload.path, ...(Array.isArray(payload.paths) ? payload.paths : [])]
    .filter((path) => path !== undefined)
  const rawTags = [payload.tag, ...(Array.isArray(payload.tags) ? payload.tags : [])]
    .filter((tag) => tag !== undefined)
  const paths = uniqueStrings(rawPaths, 1024)
  const tags = uniqueStrings(rawTags, 256)

  if (!paths || paths.some((path) => !path.startsWith('/') || path.startsWith('//'))) {
    return Response.json({ ok: false, error: 'Invalid path' }, { status: 400 })
  }
  if (!tags) {
    return Response.json({ ok: false, error: 'Invalid tag' }, { status: 400 })
  }
  if (paths.length === 0 && tags.length === 0) {
    return Response.json({ ok: false, error: 'Missing path or tag' }, { status: 400 })
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }

  return Response.json({
    ok: true,
    revalidated: {
      paths,
      tags,
    },
  })
}
