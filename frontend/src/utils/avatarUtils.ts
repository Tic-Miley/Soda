/**
 * Utility function to convert avatar paths to full URLs
 * @param avatarPath The path to the avatar from the database
 * @returns The complete URL to the avatar image
 */
export const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  if (!avatarPath) return "/icons/avatar_origin.png";
  if (avatarPath.startsWith('http')) return avatarPath;
  if (avatarPath.startsWith('/static')) {
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${avatarPath}`;
  }
  return avatarPath;
};