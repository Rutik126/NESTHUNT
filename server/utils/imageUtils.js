// utils/imageUtils.js
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg';
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle Windows paths
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Remove any leading server path if present
  const relativePath = normalizedPath.replace(/^.*\/uploads\//, '/uploads/');
  
  return `http://localhost:5000${relativePath}`;
};