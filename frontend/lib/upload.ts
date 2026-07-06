export async function uploadImageToSecureProxy(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64data = reader.result;
        const token = localStorage.getItem("ysg_admin_token");
        
        if (!token) {
          throw new Error("Unauthorized to upload image");
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        const res = await fetch(`${API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64data })
        });

        const data = await res.json();

        if (!res.ok || !data.secure_url) {
          throw new Error(data.error || "Failed to upload image securely");
        }

        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
        resolve(optimizedUrl);
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}
