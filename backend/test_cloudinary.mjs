async function testUpload() {
  const cloudName = 'dn4ciyses';
  const uploadPreset = 'ysg-website';
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const formData = new FormData();
  formData.append('file', image);
  formData.append('upload_preset', uploadPreset);

  try {
    const cloudinaryRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });
    const data = await cloudinaryRes.json();
    console.log("Status:", cloudinaryRes.status);
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testUpload();
