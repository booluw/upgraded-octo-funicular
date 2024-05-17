import axios from "axios";

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-gb', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function uploadToCloudinary(file: File) {
  const url = import.meta.env.VITE_CLOUDINARY_URL
  const formData = new FormData();

  formData.append('upload_preset', 'area_finder');
  formData.append('folder', 'AreaFinder')
  formData.append('file', file);
  let response;
  try {
    response = await axios.post(url, formData) as any;
  } catch (error: any) {
    throw Error(error.message ?? error);
  }

  return response.data.secure_url;
}