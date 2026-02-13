// Generate DiceBear avatar URL based on user name
// Using the "avataaars" style for fun, colorful avatars
export const getAvatarUrl = (name) => {
    if (!name) return null;

    // Use DiceBear API with avataaars style
    // This generates consistent avatars based on the seed (name)
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

// Alternative styles you can use:
// - adventurer: Modern, illustrated style
// - avataaars: Sketch-style avatars (current)
// - bottts: Robot avatars
// - fun-emoji: Emoji-based
// - lorelei: Illustrated female avatars
// - micah: Illustrated avatars
// - personas: Professional avatars

export default getAvatarUrl;
