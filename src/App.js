import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Logo from "./images/logo icon.svg";
import Menu from "./images/menu icon.svg";
import Previous from "./images/previous icon.svg";
import Next from "./images/next icon.svg";
import Volume from "./images/volume icon.svg";
import Search from "./images/search icon.svg";
import Avatar from "./images/avatar icon.svg";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState("For You");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSong, setCurrentSong] = useState(null);
  const [bgColor, setBgColor] = useState("#000");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    axios
      .get("https://cms.samespace.com/items/songs")
      .then((response) => {
        const data = response.data.data || [];
        setSongs(data);
      })
      .catch((error) => console.error("Error fetching songs:", error));
  }, []);

  useEffect(() => {
    if (songs.length > 0) {
      songs.forEach((song, index) => {
        if (!song.duration) {
          const audio = new Audio(song.url);
          audio.addEventListener("loadedmetadata", () => {
            const updatedSongs = [...songs];
            updatedSongs[index].duration = audio.duration;
            setSongs(updatedSongs);
          });
        }
      });
    }
  }, [songs]);

  useEffect(() => {
    if (currentSong && currentSong.accent) {
      setBgColor(currentSong.accent);
      if (audioRef.current) {
        audioRef.current.src = currentSong.url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current.currentTime);
      };
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration);
      };
    }
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex > 0) {
      setCurrentSong(songs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
    }
  };

  const handleSeek = (event) => {
    if (audioRef.current) {
      audioRef.current.currentTime = event.target.value;
      setCurrentTime(event.target.value);
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.name && song.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const forYouSongs = filteredSongs.filter((song) => !song.top_track);
  const topTracks = filteredSongs.filter((song) => song.top_track);

  return (
    <div
      className="app"
      style={{ background: `linear-gradient(-45deg,#000000, ${bgColor})` }}
    >
      <div className="logo-avatar">
        <img src={Logo} alt="Spotify" className="logo" />

        <img src={Avatar} alt="Avatar" className="avatar" />
      </div>
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="tabs">
          <button
            onClick={() => setActiveTab("For You")}
            className={activeTab === "For You" ? "active" : ""}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("Top Tracks")}
            className={activeTab === "Top Tracks" ? "active" : ""}
          >
            Top Tracks
          </button>
        </div>
        <div className="searchbar-div">
          <input
            type="text"
            placeholder="Search Song, Artist"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <img src={Search} alt="" />
        </div>
        <ul className="song-list">
          {(activeTab === "For You" ? forYouSongs : topTracks).map((song) => (
            <li key={song.id} onClick={() => setCurrentSong(song)}>
              <img
                src={`https://cms.samespace.com/assets/${song.cover}`}
                alt={song.name || "No title"}
              />
              <div>
                <p className="song-name">{song.name || "Unknown Title"}</p>
                <p className="song-artist">{song.artist || "Unknown Artist"}</p>
              </div>
              <p className="song-name song-duration">
                {song.duration ? formatDuration(song.duration) : "0:00"}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mobile-header">
        <img
          src={Menu}
          alt="Menu"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      {currentSong && (
        <div className="current-song">
          <div className="current-song-details">
            <h1 className="current-song-name">
              {currentSong.name || "Unknown Title"}
            </h1>
            <p className="current-song-artist">
              {currentSong.artist || "Unknown Artist"}
            </p>
          </div>
          <img
            src={`https://cms.samespace.com/assets/${currentSong.cover}`}
            alt={currentSong.name || "No title"}
            className="song-image"
          />
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
            />
          </div>
          <div className="player-controls">
            <img src={Menu} alt="Menu" />
            <img src={Previous} alt="Previous" onClick={handlePrevious} />
            <i
              className={`fas ${isPlaying ? "fa-pause" : "fa-play"} play-pause`}
              onClick={handlePlayPause}
            ></i>
            <img src={Next} alt="Next" onClick={handleNext} />
            <img src={Volume} alt="Volume" />
          </div>
        </div>
      )}
      <audio ref={audioRef} controls />
    </div>
  );
}

export default App;
