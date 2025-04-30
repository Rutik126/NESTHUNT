// utils/imageUtils.js
const getDefaultProfileImage = () => '/images/default-profile.jpg';
const getDefaultPropertyImage = () => '/default-property.jpg';

export const getImageUrl = (imgPath) => {
    if (!imgPath) return getDefaultPropertyImage();
    if (imgPath.startsWith('http')) return imgPath;
    
    // Normalize path (replace backslashes with forward slashes)
    const normalizedPath = imgPath.replace(/\\/g, '/');
    
    // Remove leading slashes to prevent double slashes in URL
    const cleanPath = normalizedPath.replace(/^\/+/, '');
    
    // Check if the path is already a full URL
    if (cleanPath.startsWith('http')) {
        return cleanPath;
    }
    
    return `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${cleanPath}`;
};
export { getDefaultPropertyImage };
