import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function App() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/player_api?username=cbfa4abc2f&password=2da068dcfb39&action=get_live_streams')
      .then(res => res.text())
      .then(text => {
        const data = JSON.parse(text);
        setChannels(data);
      });
  }, []);

  const playChannel = (channel) => {
    setSelectedChannel(channel);
    const url = `http://localhost:3001/api/stream-proxy/live/cbfa4abc2f/2da068dcfb39/${channel.stream_id}.m3u8`;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().catch(err => console.error('Autoplay blocked:', err));
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
      videoRef.current.play().catch(err => console.error('Native play error:', err));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Kanały</h1>

      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        className="w-full max-h-[360px] bg-black mb-4"
        crossOrigin="anonymous"
        onDoubleClick={() => videoRef.current.requestFullscreen()}
      />

      <ul className="mb-4">
        {channels.map((ch) => (
          <li key={ch.stream_id}>
            <button onClick={() => playChannel(ch)}>{ch.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
