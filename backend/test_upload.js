import fs from 'fs';

async function testUpload() {
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dn4ciyses/image/upload`;
  const uploadPreset = 'ysg-website';

  // create a dummy 1x1 pixel image base64
  const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const formData = new FormData();
  formData.append('file', image);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Data:", data);
}

testUpload().catch(console.error);
