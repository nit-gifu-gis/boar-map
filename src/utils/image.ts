export const isObjectURLAvailable = async (url: string) => {
  if (!url.startsWith('blob:')) {
    return false;
  }

  try {
    const response = await fetch(url, { method: 'GET' });
    return response.ok;
  } catch (e) {
    return false;
  }
};