import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from './db/index.js'
import { samples } from './db/schema.js'
import { whereAndExcludeDeleted } from './db/soft-delete.js'
import { eq } from 'drizzle-orm'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// GET /samples - 全件取得（削除済み除外）
app.get('/samples', async (c) => {
  const result = await db.select().from(samples).where(whereAndExcludeDeleted(samples))
  return c.json(result)
})

// GET /samples/:id - 1件取得（削除済み除外）
app.get('/samples/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.select().from(samples).where(
    whereAndExcludeDeleted(samples, eq(samples.id, id))
  )
  if (result.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json(result[0])
})

// POST /samples - 作成
app.post('/samples', async (c) => {
  const body = await c.req.json()
  const result = await db.insert(samples).values({
    text: body.text,
  }).returning()
  return c.json(result[0], 201)
})

// PUT /samples/:id - 更新（削除済み除外）
app.put('/samples/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const result = await db.update(samples)
    .set({ text: body.text, updatedAt: new Date() })
    .where(whereAndExcludeDeleted(samples, eq(samples.id, id)))
    .returning()
  if (result.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json(result[0])
})

// DELETE /samples/:id - ソフトデリート（deletedAtを設定）
app.delete('/samples/:id', async (c) => {
  const id = c.req.param('id')
  const result = await db.update(samples)
    .set({ deletedAt: new Date() })
    .where(whereAndExcludeDeleted(samples, eq(samples.id, id)))
    .returning()
  if (result.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json({ message: 'Deleted' })
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
