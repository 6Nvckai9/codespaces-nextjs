import { useState } from 'react';

const MODES = [
  { label: 'Instagram', value: 'igdl' },
  { label: 'TikTok', value: 'ttdl' },
  { label: 'YouTube MP3', value: 'ytmp3' },
  { label: 'YouTube MP4', value: 'ytmp4' },
  { label: 'Facebook', value: 'fbdl' },
  { label: 'YouTube Search', value: 'ytsearch' },
];

// Helper: convert result JSON jadi teks yang user-friendly
function formatResult(mode, data) {
  switch (mode) {
    case 'igdl':
      // data: { data: [{ url, ... }, ...] }
      if (!data.data) return 'No data';
      return data.data.map((media, i) => `Media ${i + 1}: ${media.url}`).join('\n');

    case 'ttdl':
      // ttdl returns object with video, title etc
      return `Title: ${data.title}
Author: ${data.author}
Username: ${data.username}
Published: ${data.published}
Likes: ${data.like}
Comments: ${data.comment}
Shares: ${data.share}
Views: ${data.views}
Video URL: ${data.video}
Cover URL: ${data.cover}
Music URL: ${data.music}
Profile Picture: ${data.profilePicture}`;

    case 'ytmp3':
      return `Title: ${data.title}
Author: ${data.author}
Duration: ${data.duration}
Views: ${data.views}
Audio URL: ${data.audio}
Thumbnail: ${data.thumbnail}
Description: ${data.description}`;

    case 'ytmp4':
      return `Title: ${data.title}
Author: ${data.author}
Duration: ${data.duration}
Views: ${data.views}
Video URL: ${data.video}
Audio URL: ${data.audio}
Thumbnail: ${data.thumbnail}
Description: ${data.description}`;

    case 'fbdl':
      // fbdl returns { data: [...] }
      if (!data.data) return 'No data';
      return data.data.map((media, i) => `Media ${i + 1}: ${media.url}`).join('\n');

    case 'ytsearch':
      // ytsearch returns { video: [...], channel: [...] }
      if (!data.video && !data.channel) return 'No data found';
      return [
        ...((data.video || []).map((v, i) => `[Video ${i + 1}] Title: ${v.title}\nURL: ${v.url}\nDuration: ${v.durationH}\nViews: ${v.view}\nUploaded: ${v.publishedTime}`)),
        ...((data.channel || []).map((c, i) => `[Channel ${i + 1}] Name: ${c.channelName}\nURL: ${c.url}\nSubscribers: ${c.subscriberH}\nVideos: ${c.videoCount}`))
      ].join('\n\n');
    
    default:
      return JSON.stringify(data, null, 2);
  }
}

export default function Downloader() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('igdl');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError(null);
    setDownloadUrl(null);

    try {
      let apiUrl = `/api/downloader/${mode}`;
      const paramName = mode === 'ytsearch' ? 'query' : 'url';
      const query = new URLSearchParams({ [paramName]: url });
      const res = await fetch(`${apiUrl}?${query.toString()}`);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch data');
      }

      const data = await res.json();
      const text = formatResult(mode, data);
      setResult(text);

      // Cek untuk link download (contoh sederhana):
      // Instagram & Facebook: data.data array berisi media.url
      // TikTok: data.video
      // YT mp4: data.video
      // YT mp3: data.audio
      // YouTube Search: ga ada direct download
      if (mode === 'igdl' && data.data && data.data.length > 0) {
        setDownloadUrl(data.data[0].url);
      } else if (mode === 'fbdl' && data.data && data.data.length > 0) {
        setDownloadUrl(data.data[0].url);
      } else if (mode === 'ttdl' && data.video) {
        setDownloadUrl(data.video);
      } else if (mode === 'ytmp4' && data.video) {
        setDownloadUrl(data.video);
      } else if (mode === 'ytmp3' && data.audio) {
        setDownloadUrl(data.audio);
      } else {
        setDownloadUrl(null);
      }
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    alert('Copied to clipboard!');
  };

  return (
    <main style={{ maxWidth: 700, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Media Downloader</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <label htmlFor="mode">Select Platform: </label>
        <select
          id="mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ marginRight: 20, padding: '4px 8px' }}
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={mode === 'ytsearch' ? 'Enter search query' : 'Enter media URL'}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: '50%', padding: '6px 8px', marginRight: 20 }}
          required
        />

        <button type="submit" disabled={loading} style={{ padding: '6px 16px' }}>
          {loading ? 'Loading...' : 'Download'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: 20 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            whiteSpace: 'pre-wrap',
            backgroundColor: '#f0f0f0',
            padding: 15,
            borderRadius: 5,
            position: 'relative',
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Copy
          </button>
          <h2>Result:</h2>
          <pre style={{ marginTop: 30 }}>{result}</pre>
        </div>
      )}

      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          style={{
            display: 'inline-block',
            marginTop: 20,
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 5,
            textDecoration: 'none',
          }}
        >
          Download Media
        </a>
      )}
    </main>
  );
}
