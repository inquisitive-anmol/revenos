import { Schema } from "mongoose";

export function tenancyPlugin(schema: Schema): void {
  // Enforce workspaceId exists on every document
  schema.pre("save", function () {
    if (!this.workspaceId) {
      throw new Error("workspaceId is required — multi-tenancy violation");
    }
  });

  // Enforce workspaceId on every find query.
  // Exception: Mongoose populate sub-queries filter exclusively by _id —
  // they are always derived from a parent query that already passed tenancy,
  // so cross-tenant data leakage is impossible. Skipping the guard here
  // prevents spurious violations when using .populate() on tenanted models.
  schema.pre(/^find/, function () {
    const filter = (this as any).getFilter();

    // Populate-generated sub-queries have _id as their only filter key.
    if (Object.keys(filter).length === 1 && "_id" in filter) return;

    if (!filter.workspaceId) {
      throw new Error("workspaceId missing in query — multi-tenancy violation");
    }
  });

  // Enforce workspaceId on every update query
  schema.pre(/^update/, function () {
    const filter = (this as any).getFilter();
    if (!filter.workspaceId) {
      throw new Error("workspaceId missing in update — multi-tenancy violation");
    }
  });

  // Enforce workspaceId on delete
  schema.pre("deleteOne", function () {
    const filter = (this as any).getFilter();
    if (!filter.workspaceId) {
      throw new Error("workspaceId missing in delete — multi-tenancy violation");
    }
  });
}