
import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

const API_URL = '/api/player_api';
const EPG_URL = '/api/xmltv';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [channels, setChannels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [epg, setEpg] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}?username=cbfa4abc2f&password=2da068dcfb39&action=get_live_streams`);
        const text = await res.text();
        const data = JSON.parse(text);
        setChannels(data);
        setGroups(['All', ...new Set(data.map(ch => ch.category_id).filter(Boolean))]);
        setIsLoggedIn(true);

        const epgRes = await fetch(`${EPG_URL}?username=cbfa4abc2f&password=2da068dcfb39`);
        const epgText = await epgRes.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(epgText, 'text/xml');
        const programs = Array.from(doc.querySelectorAll('programme')).map(p => ({
          channel: p.getAttribute('channel'),
          title: p.querySelector('title')?.textContent,
          start: p.getAttribute('start'),
          stop: p.getAttribute('stop')
        }));
        setEpg(programs);
      } catch (err) {
        console.error('Błąd:', err);
      }
    };
    fetchData();
  }, []);

  const playChannel = (channel) => {
    setSelectedChannel(channel);
    const url = `http://b3.dinott.com/live/cbfa4abc2f/2da068dcfb39/${channel.stream_id}.m3u8`;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
    } else {
      console.error('HLS is not supported in this browser');
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const getEpgFor = (channel) => {
    return epg
      .filter(p => p.channel === channel.epg_channel_id)
      .map(p => {
        const start = new Date(p.start.slice(0, 14).replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5'));
        return { ...p, start };
      })
      .sort((a, b) => a.start - b.start);
  };

  const filteredChannels = channels.filter(c =>
    selectedGroup === 'All' || c.category_id === selectedGroup
  );

  if (!isLoggedIn) return <div className="p-6 text-center">⏳ Loading IPTV data...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="md:col-span-1">
        <h2 className="text-xl font-bold mb-2">📂 Groups</h2>
        <select
          className="border p-2 w-full mb-4"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map((g, i) => (
            <option key={i} value={g}>Group {g}</option>
          ))}
        </select>

        <ul className="space-y-1 overflow-y-auto max-h-[70vh]">
          {filteredChannels.map((channel) => (
            <li key={channel.stream_id}>
              <button
                className="w-full text-left border p-2 rounded hover:bg-blue-100"
                onClick={() => playChannel(channel)}
              >
                {channel.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-2">
        <h2 className="text-xl font-bold mb-2">▶️ Preview</h2>
        <div className="bg-black rounded p-2">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full max-h-[360px] cursor-pointer"
            onDoubleClick={toggleFullScreen}
            crossOrigin="anonymous"
          />
        </div>

        {selectedChannel && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">📆 EPG – {selectedChannel.name}</h3>
            <ul className="text-sm space-y-1">
              {getEpgFor(selectedChannel).map((entry, i) => (
                <li key={i} className="border-b">
                  {entry.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {entry.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
