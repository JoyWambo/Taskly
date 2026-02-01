/**
 * Generate avatar URL using UI-Avatars.com service
 * @param {string} providedAvatar - User-provided avatar URL (optional)
 * @param {string} name - User's full name
 * @param {Object} options - Avatar configuration options
 * @returns {string} Avatar URL
 */
export const generateAvatar = (providedAvatar, name, options = {}) => {
  // Return provided avatar if it exists and is a valid URL
  if (providedAvatar && typeof providedAvatar === 'string' && providedAvatar.startsWith('http')) {
    return providedAvatar;
  }

  // Default configuration
  const defaults = {
    size: 150,
    background: '3498db', // Professional blue
    color: 'ffffff', // White text
    bold: true,
    format: 'png',
    fontSize: 0.5, // 50% of size
    length: 2, // Show 2 characters (initials)
    rounded: true, // Circular avatars
    uppercase: true,
  };

  // Color themes and roles
  const colors = {
    admin: { background: 'e74c3c', color: 'ffffff' }, // Red for admin
    user: { background: '27ae60', color: 'ffffff' }, // Green for regular users
    light: { background: '3498db', color: 'ffffff' }, // Blue for light theme
    dark: { background: '2c3e50', color: 'ecf0f1' }, // Dark blue-gray for dark theme
  };

  // Apply theme/role colors if specified
  if (options.isAdmin !== undefined) {
    const roleColors = options.isAdmin ? colors.admin : colors.user;
    defaults.background = roleColors.background;
    defaults.color = roleColors.color;
  } else if (options.theme) {
    const themeColors = colors[options.theme] || colors.light;
    defaults.background = themeColors.background;
    defaults.color = themeColors.color;
  }

  // Merge with provided options
  const config = { ...defaults, ...options };

  // Clean and prepare the name
  const cleanName = encodeURIComponent(name.trim());

  // Build the URL with parameters
  const params = new URLSearchParams({
    name: cleanName,
    size: config.size,
    background: config.background,
    color: config.color,
    bold: config.bold,
    format: config.format,
    'font-size': config.fontSize,
    length: config.length,
    rounded: config.rounded,
    uppercase: config.uppercase,
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
};

/**
 * Generate multiple avatar variations for user selection
 * @param {string} name - User's name
 * @returns {Array} Array of avatar URLs with different styles
 */
export const getAvatarVariations = (name) => {
  const backgroundColors = [
    { color: '3498db', name: 'Blue' },
    { color: '9b59b6', name: 'Purple' },
    { color: 'e74c3c', name: 'Red' },
    { color: 'f39c12', name: 'Orange' },
    { color: '27ae60', name: 'Green' },
    { color: '34495e', name: 'Dark Gray' }
  ];

  return backgroundColors.map((colorOption, index) => ({
    id: index + 1,
    name: colorOption.name,
    url: generateAvatar(null, name, {
      background: colorOption.color,
      color: 'ffffff',
      rounded: true,
      bold: true,
    }),
    backgroundColor: `#${colorOption.color}`,
  }));
};