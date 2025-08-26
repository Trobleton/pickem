import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";

async function getUserByClerkId(ctx: QueryCtx, clerkId: string) {
    const user = await ctx.db.query('users').withIndex('clerkId', (q) => q.eq('clerkId', clerkId)).first();
    return user
}

export const findUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await getUserByClerkId(ctx, args.clerkId);
        return { success: true, data: user }
    }
})

export const createUser = mutation({
    args: {
        clerkId: v.string(),
        username: v.string(),
        displayName: v.string(),
        photo: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await getUserByClerkId(ctx, args.clerkId)
        if (existingUser) return { success: false }

        const user = await ctx.db.insert('users', args);
        return { success: true, data: user }
    }
})

export const updateUser = mutation({
    args: {
        clerkId: v.string(),
        username: v.string(),
        displayName: v.string(),
        photo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getUserByClerkId(ctx, args.clerkId)
        if (!user) return { success: false }

        const updatedUser = await ctx.db.patch(user._id, args)
        return { success: true, data: updatedUser }
    }
})

export const deleteUser = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await getUserByClerkId(ctx, args.clerkId)
        if (!user) return { success: false }

        await ctx.db.delete(user._id)
        return { success: true }
    }
})