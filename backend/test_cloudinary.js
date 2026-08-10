const cloudName = 'dn4ciyses';
const uploadPreset = 'ysg-website';
const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

const base64data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64data, 'base64');
const blob = new Blob([buffer], { type: 'image/png' });

const formData = new FormData();
formData.append('file', blob, 'upload.png');
formData.append('upload_preset', uploadPreset);

fetch(cloudinaryUrl, { method: 'POST', body: formData })
  .then(res => res.json())
  .then(data => console.log("Cloudinary Response:", data))
  .catch(console.error);
