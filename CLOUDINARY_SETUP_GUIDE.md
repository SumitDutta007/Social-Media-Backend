# ☁️ Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a **free cloud-based image and video management service** that provides:
- ✅ Image/video upload and storage
- ✅ Automatic optimization and compression
- ✅ Image transformations (resize, crop, filters)
- ✅ CDN delivery for fast loading
- ✅ **Free tier: 25 GB storage + 25 GB bandwidth/month**

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with email or Google/GitHub
3. Verify your email
4. You'll get:
   - Cloud name
   - API Key
   - API Secret

### Step 2: Get Your Credentials

1. Login to Cloudinary Dashboard
2. Go to: https://cloudinary.com/console
3. You'll see your credentials:

```
Cloud name: your_cloud_name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

### Step 3: Add to Environment Variables

Update your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

**⚠️ Important:** 
- Never commit `.env` to GitHub
- Use real values, not placeholders
- Keep API Secret private

---

## 📁 Folder Structure

Your images are automatically organized:

```
cloudinary/
├── social-media/
│   ├── profiles/       (Profile pictures - 500x500)
│   ├── covers/         (Cover photos - 1200x400)
│   └── posts/          (Post images - 1000x1000)
```

---

## 🎨 Image Transformations

### Automatic Optimizations

**Profile Pictures:**
- Max size: 500x500 pixels
- Auto-compression
- Format: JPG, PNG, GIF, WEBP

**Cover Pictures:**
- Max size: 1200x400 pixels
- Auto-cropping to fit
- CDN delivery

**Post Images:**
- Max size: 1000x1000 pixels
- Quality optimization
- Fast loading

---

## 📝 API Usage

### Upload Profile Picture

```javascript
POST /api/users/:id/upload-profile
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
  image: [File]
```

**Response:**
```json
{
  "message": "Profile picture uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/your_cloud/image/upload/v123456/social-media/profiles/abc123.jpg"
}
```

### Upload Post Image

```javascript
POST /api/posts/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
  image: [File]
```

---

## 🌐 Frontend Integration

### React File Upload Component

```javascript
import { useState } from 'react';
import axios from 'axios';

function ImageUpload({ userId, type = 'profile' }) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);

    try {
      const endpoint = type === 'profile' 
        ? `/api/users/${userId}/upload-profile`
        : `/api/posts/upload`;

      const response = await axios.post(
        `http://localhost:8800${endpoint}`,
        formData,
        {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        }
      );

      setImageUrl(response.data.imageUrl);
      alert('Upload successful!');
    } catch (error) {
      alert('Upload failed: ' + error.response?.data?.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" style={{width: '200px'}} />}
    </div>
  );
}
```

### Create Post with Image

```javascript
const createPost = async () => {
  // Step 1: Upload image
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  const uploadRes = await axios.post(
    'http://localhost:8800/api/posts/upload',
    formData,
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  );

  // Step 2: Create post with image URL
  const postRes = await axios.post(
    'http://localhost:8800/api/posts',
    {
      userId: userId,
      desc: postDescription,
      img: uploadRes.data.imageUrl
    },
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  );

  console.log('Post created:', postRes.data);
};
```

---

## 🎯 Advantages Over Local Storage

| Feature | Cloudinary | Local Storage |
|---------|-----------|---------------|
| Storage Cost | Free 25GB | Server disk space |
| CDN Delivery | ✅ Global | ❌ Single server |
| Auto-optimization | ✅ Yes | ❌ Manual |
| Image transformations | ✅ On-the-fly | ❌ Pre-process |
| Backup | ✅ Automatic | ❌ Manual |
| Scalability | ✅ Unlimited | ❌ Server limits |
| Load time | ⚡ Fast | 🐌 Slow |

---

## 🔒 Security Features

### 1. Allowed Formats
Only accepts: JPG, JPEG, PNG, GIF, WEBP

### 2. Size Limits
Automatic resizing prevents huge files

### 3. Authentication Required
All uploads require valid JWT token

### 4. Folder Isolation
Each type (profile, cover, post) in separate folders

---

## 📊 Cloudinary Dashboard Features

### Media Library
- View all uploaded images
- Delete unwanted images
- Download originals
- Get image URLs

### Usage Monitoring
- Track storage usage
- Monitor bandwidth
- View transformation credits
- Upgrade if needed

### Transformations
- Crop images
- Apply filters
- Resize dynamically
- Add watermarks

---

## 🚀 Production Deployment

### Render Environment Variables

1. Go to Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Add variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

5. Save and redeploy

### Verify Setup

Check Render logs for:
```
✅ Cloudinary configured successfully
```

---

## 🧪 Testing

### Using Postman

1. **Login to get token:**
```
POST http://localhost:8800/api/auth/login
Body: { "username": "test", "password": "password" }
```

2. **Upload image:**
```
POST http://localhost:8800/api/posts/upload
Authorization: Bearer <your_token>
Body: form-data
  - Key: image
  - Type: File
  - Value: [Select image file]
```

3. **Create post with image:**
```
POST http://localhost:8800/api/posts
Authorization: Bearer <your_token>
Body: JSON
{
  "userId": "your_user_id",
  "desc": "Test post",
  "img": "https://res.cloudinary.com/..."
}
```

---

## 🔧 Troubleshooting

### Error: "Invalid API credentials"
- Check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
- Make sure no extra spaces in .env file

### Error: "No file uploaded"
- Ensure `Content-Type: multipart/form-data`
- Check file input name is "image"
- Verify file is selected

### Error: "Upload failed"
- Check file format (must be JPG, PNG, GIF, WEBP)
- Verify file size is reasonable
- Check network connection

### Images not loading
- Verify image URL in response
- Check Cloudinary dashboard for uploaded images
- Ensure image URL is HTTPS

---

## 📈 Free Tier Limits

Cloudinary Free Account includes:

- ✅ **Storage:** 25 GB
- ✅ **Bandwidth:** 25 GB/month
- ✅ **Transformations:** 25,000/month
- ✅ **Storage images:** Unlimited count
- ✅ **CDN:** Global delivery

**This is enough for:**
- ~25,000 images (1MB each)
- ~250,000 page views/month
- Unlimited users

---

## 🎓 Additional Features (Optional)

### Custom Transformations

```javascript
// In cloudinary.js config
transformation: [
  { width: 500, height: 500, crop: 'fill', gravity: 'face' },
  { quality: 'auto' },
  { fetch_format: 'auto' }
]
```

### Video Upload

```javascript
// Add video storage
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-media/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi']
  }
});
```

---

## 📚 Resources

- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Documentation:** https://cloudinary.com/documentation
- **Node.js SDK:** https://cloudinary.com/documentation/node_integration
- **Support:** https://support.cloudinary.com/

---

## ✅ Checklist

Before going to production:

- [ ] Cloudinary account created
- [ ] Credentials added to `.env`
- [ ] Environment variables set in Render
- [ ] Upload endpoints tested
- [ ] Frontend integration working
- [ ] Images loading from Cloudinary CDN
- [ ] Error handling implemented
- [ ] File size limits appropriate

---

**🎉 You're all set! Your app now uses professional cloud storage for images!**

**Benefits:**
- ⚡ Faster load times
- 📈 Scalable infrastructure
- 💰 Free for most use cases
- 🌍 Global CDN delivery
- 🔒 Secure and reliable
