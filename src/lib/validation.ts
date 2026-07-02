import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_.]{3,30}$/, "3–30 characters: letters, numbers, _ or .");

export const passwordSchema = z
  .string()
  .min(6, "At least 6 characters")
  .max(72, "At most 72 characters");

export const credentialsSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const trackInputSchema = z.object({
  position: z.number().int().positive(),
  name: z.string().trim().min(1).max(300),
  spotifyUrl: z.string().url().max(500).nullable().optional(),
  starred: z.boolean().default(false),
});

export const albumInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  artist: z.string().trim().min(1, "Required").max(200),
  year: z
    .number()
    .int()
    .min(1860)
    .max(new Date().getFullYear() + 1)
    .nullable()
    .optional(),
  review: z.string().max(2000).nullable().optional(),
  liked: z.boolean().default(false),
  favorite: z.boolean().default(false),
  coverUrl: z.string().url().max(1000).nullable().optional(),
  spotifyUrl: z.string().url().max(1000).nullable().optional(),
  spotifyId: z.string().max(64).nullable().optional(),
  dominantColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
  tracks: z.array(trackInputSchema).max(100).default([]),
});

export type AlbumInput = z.infer<typeof albumInputSchema>;
export type TrackInput = z.infer<typeof trackInputSchema>;
