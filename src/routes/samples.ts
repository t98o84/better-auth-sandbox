import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db } from "../db/index.js";
import { samples, sampleSelectSchema } from "../db/schema.js";
import { whereAndExcludeDeleted } from "../db/soft-delete.js";
import { eq } from "drizzle-orm";

// ==================================================
// Schemas
// ==================================================
const SampleSchema = sampleSelectSchema.openapi("Sample");

const SampleListSchema = z.array(SampleSchema).openapi("SampleList");

const SampleIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "01234567-89ab-cdef-0123-456789abcdef",
  }),
});

const CreateSampleSchema = z
  .object({
    text: z.string().min(1).openapi({
      example: "Sample text",
    }),
  })
  .openapi("CreateSample");

const UpdateSampleSchema = z
  .object({
    text: z.string().min(1).openapi({
      example: "Updated sample text",
    }),
  })
  .openapi("UpdateSample");

const ErrorSchema = z
  .object({
    error: z.string().openapi({
      example: "Not found",
    }),
  })
  .openapi("Error");

const DeletedSchema = z
  .object({
    message: z.string().openapi({
      example: "Deleted",
    }),
  })
  .openapi("Deleted");

// ==================================================
// Routes
// ==================================================
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Samples"],
  summary: "Get all samples",
  description: "Retrieve all samples (excluding soft-deleted ones)",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SampleListSchema,
        },
      },
      description: "List of samples",
    },
  },
});

const getRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Samples"],
  summary: "Get a sample by ID",
  description: "Retrieve a single sample by its ID",
  request: {
    params: SampleIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SampleSchema,
        },
      },
      description: "Sample found",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Sample not found",
    },
  },
});

const createSampleRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Samples"],
  summary: "Create a new sample",
  description: "Create a new sample record",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSampleSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: SampleSchema,
        },
      },
      description: "Sample created",
    },
  },
});

const updateRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Samples"],
  summary: "Update a sample",
  description: "Update an existing sample by its ID",
  security: [{ Bearer: [] }],
  request: {
    params: SampleIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateSampleSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SampleSchema,
        },
      },
      description: "Sample updated",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Sample not found",
    },
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Samples"],
  summary: "Delete a sample",
  description: "Soft delete a sample by setting deletedAt",
  security: [{ Bearer: [] }],
  request: {
    params: SampleIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: DeletedSchema,
        },
      },
      description: "Sample deleted",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Sample not found",
    },
  },
});

// ==================================================
// App
// ==================================================
const app = new OpenAPIHono()
  .openapi(listRoute, async (c) => {
    const result = await db
      .select()
      .from(samples)
      .where(whereAndExcludeDeleted(samples));
    return c.json(result, 200);
  })
  .openapi(getRoute, async (c) => {
    const { id } = c.req.valid("param");
    const result = await db
      .select()
      .from(samples)
      .where(whereAndExcludeDeleted(samples, eq(samples.id, id)));
    if (result.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(result[0], 200);
  })
  .openapi(createSampleRoute, async (c) => {
    const body = c.req.valid("json");
    const result = await db
      .insert(samples)
      .values({
        text: body.text,
      })
      .returning();
    return c.json(result[0], 201);
  })
  .openapi(updateRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await db
      .update(samples)
      .set({ text: body.text, updatedAt: new Date() })
      .where(whereAndExcludeDeleted(samples, eq(samples.id, id)))
      .returning();
    if (result.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(result[0], 200);
  })
  .openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid("param");
    const result = await db
      .update(samples)
      .set({ deletedAt: new Date() })
      .where(whereAndExcludeDeleted(samples, eq(samples.id, id)))
      .returning();
    if (result.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json({ message: "Deleted" }, 200);
  });

export default app;
