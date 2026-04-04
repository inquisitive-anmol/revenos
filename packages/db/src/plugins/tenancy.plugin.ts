import { Schema } from "mongoose";

export function tenancyPlugin(schema: Schema): void {
  // Enforce workspaceId exists on every document
  schema.pre("save", function () {
    if (!this.workspaceId) {
      throw new Error("workspaceId is required — multi-tenancy violation");
    }
  });

  // Enforce workspaceId on every find query
  schema.pre(/^find/, function () {
    const filter = (this as any).getFilter();
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