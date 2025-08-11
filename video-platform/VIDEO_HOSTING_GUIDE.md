# 🎥 Video Hosting Guide (No AWS Required)

## 🚀 **Quick Options Overview**

| Option | Setup Time | Cost | Performance | Lazy Loading |
|--------|------------|------|-------------|--------------|
| **Google Drive Direct** | 5 minutes | Free | Basic | ✅ |
| **Vercel Blob** | 15 minutes | $20/month | Excellent | ✅ |
| **Cloudinary** | 10 minutes | Free tier | Excellent | ✅ |
| **YouTube/Vimeo Embed** | 10 minutes | Free | Excellent | ✅ |

---

## 🎯 **Option 1: Google Drive Direct Links (Easiest)**

### **Step 1: Get Your Google Drive Video URLs**

1. **Share your videos** in Google Drive
2. **Copy the sharing links** (they look like this):
   ```
   https://drive.google.com/file/d/1ABC123XYZ/view?usp=sharing
   ```

3. **Extract the file IDs** (the part after `/d/` and before `/view`):
   ```
   1ABC123XYZ  ← This is your file ID
   ```

### **Step 2: Add Videos to Database**

Update the migration script:

```typescript
// In scripts/migrate-google-drive-videos.ts
const googleDriveVideos = [
  {
    title: "Mountain Bike Adventure",
    description: "Epic mountain biking through challenging trails",
    googleDriveUrl: "https://drive.google.com/file/d/1ABC123XYZ/view?usp=sharing"
  },
  {
    title: "Urban Cycling Guide", 
    description: "Tips for safe and efficient city cycling",
    googleDriveUrl: "https://drive.google.com/file/d/1DEF456UVW/view?usp=sharing"
  },
  // Add all your 30 videos here...
];
```

### **Step 3: Run Migration**

```bash
# Install ts-node if you don't have it
pnpm add -D ts-node

# Run the migration
npx ts-node scripts/migrate-google-drive-videos.ts
```

**✅ Pros:** 
- Quick setup (5 minutes)
- No additional costs
- Works immediately

**❌ Cons:**
- Limited bandwidth (100GB/day)
- May hit view quotas with many users
- Slower loading than CDNs

---

## 🎯 **Option 2: Vercel Blob Storage (Recommended)**

### **Step 1: Set up Vercel Blob**

```bash
# Already installed
pnpm add @vercel/blob
```

### **Step 2: Configure Environment Variables**

Add to your Vercel dashboard:
```
BLOB_READ_WRITE_TOKEN=your_token_here
```

### **Step 3: Upload Your Videos**

**Method A: Use the Upload Component**
- Add `<VideoUpload />` to a temporary admin page
- Upload videos one by one

**Method B: Batch Upload Script**
```typescript
// Create scripts/upload-to-vercel.ts
import { put } from '@vercel/blob';
import fs from 'fs';

async function uploadVideo(filePath: string, title: string) {
  const file = fs.readFileSync(filePath);
  const blob = await put(`${title}.mp4`, file, { access: 'public' });
  console.log(`Uploaded: ${blob.url}`);
}
```

**✅ Pros:**
- Excellent performance
- Lazy loading works perfectly
- Integrated with your Vercel deployment

**❌ Cons:**
- ~$20/month for 100GB storage
- Need to upload all videos

---

## 🎯 **Option 3: YouTube/Vimeo Embedding**

### **Step 1: Upload to YouTube/Vimeo**

1. **Upload your videos** to YouTube or Vimeo
2. **Get embed URLs**:
   - YouTube: `https://www.youtube.com/embed/VIDEO_ID`
   - Vimeo: `https://player.vimeo.com/video/VIDEO_ID`

### **Step 2: Update Video Player Component**

```typescript
// In components/video-modal.tsx
const VideoPlayer = ({ video_url }: { video_url: string }) => {
  if (video_url.includes('youtube.com') || video_url.includes('vimeo.com')) {
    return (
      <iframe
        src={video_url}
        className="w-full aspect-video"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  
  // Default video player
  return (
    <video className="w-full aspect-video" controls loading="lazy">
      <source src={video_url} type="video/mp4" />
    </video>
  );
};
```

**✅ Pros:**
- Free hosting
- Excellent performance
- Built-in analytics

**❌ Cons:**
- Public videos (can't hide)
- Platform branding
- Less control

---

## 🎯 **Option 4: Cloudinary (Free Tier)**

### **Step 1: Sign up for Cloudinary**

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your **Cloud Name**, **API Key**, and **API Secret**

### **Step 2: Install Cloudinary**

```bash
pnpm add cloudinary
```

### **Step 3: Upload Videos**

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret'
});

async function uploadToCloudinary(filePath: string) {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    quality: "auto",
    format: "mp4"
  });
  return result.secure_url;
}
```

**✅ Pros:**
- Free tier: 25GB storage, 25GB bandwidth
- Automatic video optimization
- Great performance

**❌ Cons:**
- Need to upload videos
- Paid plans for more storage

---

## 🚀 **Implementation: Lazy Loading**

Your current setup already has lazy loading! Here's how it works:

### **1. Pagination (Already Working)**
```typescript
// Your current code in app/page.tsx
const loadMoreVideos = async () => {
  const { videos: moreVideos } = await getVideos(videosPerPage, offset);
  setVideos(prevVideos => [...prevVideos, ...moreVideos]);
};
```

### **2. Video Player Lazy Loading**
```typescript
// In components/video-modal.tsx
<video 
  controls 
  preload="metadata"  // Only load metadata, not full video
  loading="lazy"      // Native lazy loading
>
  <source src={video_url} type="video/mp4" />
</video>
```

### **3. Intersection Observer (Advanced)**
```typescript
const VideoCard = ({ video }) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={videoRef}>
      {shouldLoad ? (
        <video src={video.video_url} />
      ) : (
        <div className="placeholder">Video will load when visible</div>
      )}
    </div>
  );
};
```

---

## 📋 **Quick Start Checklist**

### **For Google Drive (5 minutes):**
- [ ] Get Google Drive sharing URLs for all 30 videos
- [ ] Extract file IDs from URLs
- [ ] Update `scripts/migrate-google-drive-videos.ts`
- [ ] Run migration: `npx ts-node scripts/migrate-google-drive-videos.ts`
- [ ] Test on your website

### **For Vercel Blob (15 minutes):**
- [ ] Set up `BLOB_READ_WRITE_TOKEN` in Vercel
- [ ] Add `<VideoUpload />` component to a test page
- [ ] Upload videos one by one
- [ ] Update database with new blob URLs

### **For YouTube/Vimeo (10 minutes):**
- [ ] Upload videos to YouTube/Vimeo
- [ ] Get embed URLs
- [ ] Update database with embed URLs
- [ ] Test video player component

---

## 🎯 **My Recommendation**

**Start with Google Drive** for immediate testing, then **migrate to Vercel Blob** for production:

1. **Phase 1** (Today): Use Google Drive direct links to get everything working
2. **Phase 2** (Next week): Migrate to Vercel Blob for better performance
3. **Phase 3** (Future): Consider YouTube/Vimeo for public videos

This gives you:
- ✅ **Immediate results** with Google Drive
- ✅ **Professional performance** with Vercel Blob
- ✅ **Lazy loading** already implemented
- ✅ **No AWS costs** ever

---

## 🔧 **Need Help?**

1. **Test Google Drive URLs** first with a few videos
2. **Check database connection** with the migration script
3. **Verify video playback** in your browser
4. **Monitor performance** with browser dev tools

Let me know which option you want to implement first! 🚀 