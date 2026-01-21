"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Music, Play, Pause, Volume2, VolumeX, Heart, Clock, Zap, Brain, BarChart3, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

// Audio visualization component (without actual playback)
const AudioVisualizer = ({ songName, tempo, energy }: { 
  songName: string; 
  tempo: number;
  energy: number;
}) => {
  // Calculate wave characteristics based on song properties
  const getWaveHeight = (index: number) => {
    const baseHeight = 8;
    const variation = 6;
    
    // Use tempo to influence wave speed
    const speedFactor = tempo / 100;
    
    // Use energy to influence wave amplitude
    const amplitudeFactor = energy / 10;
    
    // Create a wave pattern that responds to song properties
    const timeOffset = Date.now() / (200 - (tempo / 2));
    const wave = Math.sin(index * 0.7 + timeOffset) * variation * amplitudeFactor;
    return baseHeight + wave;
  };

  // Calculate number of bars based on tempo (faster tempo = more bars)
  const barCount = Math.max(15, Math.min(30, Math.floor(tempo / 5)));

  return (
    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mr-3">
            <Music className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Song Visualization</div>
            <div className="text-xs text-gray-400">{songName}</div>
          </div>
        </div>
        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
          <Music className="w-5 h-5 text-accent" />
        </div>
      </div>
      
      {/* Audio visualization based on song properties */}
      <div className="flex items-center justify-center space-x-1 mb-4 h-20">
        {[...Array(barCount)].map((_, i) => (
          <div 
            key={i}
            className="flex-1 bg-gradient-to-t from-accent to-accent/70 rounded-sm transition-all duration-300"
            style={{
              height: `${getWaveHeight(i)}px`,
              animation: `wave ${1 + i * 0.1}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.05}s`,
              opacity: 0.7 + (Math.sin(i * 0.3) * 0.3),
            }}
          />
        ))}
      </div>
      
      {/* Song properties indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <Clock className="w-3 h-3 mr-1" />
            <span>{tempo} BPM</span>
          </div>
          <div className="flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            <span>{energy}/10</span>
          </div>
        </div>
        <span>Visualization only • No audio playback</span>
      </div>
      
      <style jsx>{`
        @keyframes wave {
          0% { transform: scaleY(0.8); opacity: 0.6; }
          50% { transform: scaleY(1.3); opacity: 1; }
          100% { transform: scaleY(0.8); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

// Spotify Playlist Sorter Game Implementation
export default function SpotifyPlaylistSorter({ params }: { params: { id: string, course: string } }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// Spotify AI Training Log:\n// This AI learns patterns from YOUR music classification decisions.\n`);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [timer, setTimer] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Game state
  const [gamePhase, setGamePhase] = useState<'intro' | 'training' | 'testing' | 'results'>('intro');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [userAccuracy, setUserAccuracy] = useState(0);
  const [aiAccuracy, setAiAccuracy] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isFeedbackCorrect, setIsFeedbackCorrect] = useState(false);
  const [learnedRules, setLearnedRules] = useState<any>(null);
  
  // Hover state for song name
  const [showRecommended, setShowRecommended] = useState(false);

  // Playlist categories with better color contrast and thresholds
  const playlists = [
    { 
      id: 'study', 
      name: 'Study Vibes', 
      color: 'bg-blue-600/20', 
      border: 'border-blue-500/40', 
      icon: '📚',
      textColor: 'text-blue-300',
      thresholds: {
        tempo: { min: 0, max: 90 },
        energy: { min: 0, max: 4 }
      },
      description: "Slow tempo (0-90 BPM), low energy (0-4), focused"
    },
    { 
      id: 'chill', 
      name: 'Chill', 
      color: 'bg-green-600/20', 
      border: 'border-green-500/40', 
      icon: '🌿',
      textColor: 'text-green-300',
      thresholds: {
        tempo: { min: 70, max: 100 },
        energy: { min: 2, max: 6 }
      },
      description: "Medium tempo (70-100 BPM), relaxed energy (2-6)"
    },
    { 
      id: 'party', 
      name: 'Party Mode', 
      color: 'bg-purple-600/20', 
      border: 'border-purple-500/40', 
      icon: '🎉',
      textColor: 'text-purple-300',
      thresholds: {
        tempo: { min: 110, max: 200 },
        energy: { min: 7, max: 10 }
      },
      description: "Fast tempo (110-200 BPM), high energy (7-10), vibrant"
    },
    { 
      id: 'workout', 
      name: 'Workout', 
      color: 'bg-red-600/20', 
      border: 'border-red-500/40', 
      icon: '💪',
      textColor: 'text-red-300',
      thresholds: {
        tempo: { min: 130, max: 200 },
        energy: { min: 8, max: 10 }
      },
      description: "Very fast tempo (130-200 BPM), high energy (8-10)"
    },
  ];

  // Helper function to get recommended label based on thresholds
  const getRecommendedLabel = (tempo: number, energy: number) => {
    for (const playlist of playlists) {
      const { min: tempoMin, max: tempoMax } = playlist.thresholds.tempo;
      const { min: energyMin, max: energyMax } = playlist.thresholds.energy;
      
      if (tempo >= tempoMin && tempo <= tempoMax && 
          energy >= energyMin && energy <= energyMax) {
        return playlist.id;
      }
    }
    // If no exact match, find the closest match
    return 'chill'; // default
  };

  // Song data with recommended labels (removed audio URLs)
  const trainingSongs = [
    { 
      id: 1, 
      name: "Lofi Beats #47", 
      artist: "Chillhop Music", 
      tempo: 65, 
      energy: 3, 
      mood: ["peaceful", "calm", "focused"], 
      correctPlaylist: 'study',
      description: "Slow, instrumental beats perfect for studying",
      waveColor: "from-blue-400 to-cyan-400"
    },
    { 
      id: 2, 
      name: "Dance Floor Heat", 
      artist: "Neon Waves", 
      tempo: 128, 
      energy: 9, 
      mood: ["energetic", "upbeat", "festive"], 
      correctPlaylist: 'party',
      description: "High-energy EDM track for parties",
      waveColor: "from-purple-400 to-pink-400"
    },
    { 
      id: 3, 
      name: "Morning Yoga Flow", 
      artist: "Zen Sounds", 
      tempo: 72, 
      energy: 2, 
      mood: ["relaxing", "peaceful", "gentle"], 
      correctPlaylist: 'chill',
      description: "Gentle ambient music for relaxation",
      waveColor: "from-green-400 to-emerald-400"
    },
    { 
      id: 4, 
      name: "Power Lift Anthem", 
      artist: "Gym Beats", 
      tempo: 140, 
      energy: 10, 
      mood: ["intense", "powerful", "motivating"], 
      correctPlaylist: 'workout',
      description: "Intense workout track with heavy beats",
      waveColor: "from-red-400 to-orange-400"
    },
    { 
      id: 5, 
      name: "Deep Focus", 
      artist: "Study Ambient", 
      tempo: 70, 
      energy: 3, 
      mood: ["concentrated", "calm", "instrumental"], 
      correctPlaylist: 'study',
      description: "Ambient music for deep concentration",
      waveColor: "from-blue-400 to-cyan-400"
    },
    { 
      id: 6, 
      name: "Club Banger 2024", 
      artist: "DJ Pulse", 
      tempo: 132, 
      energy: 8, 
      mood: ["danceable", "vibrant", "loud"], 
      correctPlaylist: 'party',
      description: "Latest club hit with heavy bass",
      waveColor: "from-purple-400 to-pink-400"
    },
    { 
      id: 7, 
      name: "Rainy Day Jazz", 
      artist: "Smooth Notes", 
      tempo: 80, 
      energy: 4, 
      mood: ["melancholy", "soft", "jazzy"], 
      correctPlaylist: 'chill',
      description: "Smooth jazz for rainy afternoons",
      waveColor: "from-green-400 to-emerald-400"
    },
    { 
      id: 8, 
      name: "HIIT Training", 
      artist: "Workout Nation", 
      tempo: 155, 
      energy: 9, 
      mood: ["fast", "intense", "driving"], 
      correctPlaylist: 'workout',
      description: "Fast-paced track for high-intensity training",
      waveColor: "from-red-400 to-orange-400"
    },
    { 
      id: 9, 
      name: "Library Session", 
      artist: "Study Focus", 
      tempo: 68, 
      energy: 2, 
      mood: ["quiet", "academic", "minimal"], 
      correctPlaylist: 'study',
      description: "Minimal beats for library studying",
      waveColor: "from-blue-400 to-cyan-400"
    },
    { 
      id: 10, 
      name: "Festival Energy", 
      artist: "EDM Collective", 
      tempo: 130, 
      energy: 9, 
      mood: ["explosive", "crowd", "drop"], 
      correctPlaylist: 'party',
      description: "Explosive festival anthem with big drops",
      waveColor: "from-purple-400 to-pink-400"
    },
    { 
      id: 11, 
      name: "Coffee Shop Vibes", 
      artist: "Acoustic Cafe", 
      tempo: 85, 
      energy: 4, 
      mood: ["cozy", "warm", "acoustic"], 
      correctPlaylist: 'chill',
      description: "Acoustic music perfect for coffee shops",
      waveColor: "from-green-400 to-emerald-400"
    },
    { 
      id: 12, 
      name: "Running Motivation", 
      artist: "Cardio Beats", 
      tempo: 150, 
      energy: 8, 
      mood: ["steady", "pumping", "endurance"], 
      correctPlaylist: 'workout',
      description: "Steady beat for running and cardio",
      waveColor: "from-red-400 to-orange-400"
    },
    { 
      id: 13, 
      name: "Exam Cram", 
      artist: "Focus Tools", 
      tempo: 75, 
      energy: 3, 
      mood: ["serious", "instrumental", "background"], 
      correctPlaylist: 'study',
      description: "Background music for serious studying",
      waveColor: "from-blue-400 to-cyan-400"
    },
    { 
      id: 14, 
      name: "Birthday Bash", 
      artist: "Party Crew", 
      tempo: 125, 
      energy: 7, 
      mood: ["celebratory", "fun", "popular"], 
      correctPlaylist: 'party',
      description: "Fun party track for celebrations",
      waveColor: "from-purple-400 to-pink-400"
    },
    { 
      id: 15, 
      name: "Wind Down", 
      artist: "Sleepy Sounds", 
      tempo: 60, 
      energy: 1, 
      mood: ["sleepy", "dreamy", "ambient"], 
      correctPlaylist: 'chill',
      description: "Very slow ambient for winding down",
      waveColor: "from-green-400 to-emerald-400"
    },
  ];

  const testSongs = [
    { 
      id: 16, 
      name: "Study Session Loops", 
      artist: "Brain Food", 
      tempo: 70, 
      energy: 3, 
      mood: ["focused", "repetitive", "calm"], 
      correctPlaylist: 'study',
      description: "Repetitive loops for study sessions",
      waveColor: "from-blue-400 to-cyan-400"
    },
    { 
      id: 17, 
      name: "Nightclub Energy", 
      artist: "Midnight DJ", 
      tempo: 135, 
      energy: 9, 
      mood: ["dark", "pulsing", "electronic"], 
      correctPlaylist: 'party',
      description: "Dark electronic track for nightclubs",
      waveColor: "from-purple-400 to-pink-400"
    },
    { 
      id: 18, 
      name: "Meditation Guide", 
      artist: "Mindful Moments", 
      tempo: 58, 
      energy: 2, 
      mood: ["spiritual", "calm", "guided"], 
      correctPlaylist: 'chill',
      description: "Guided meditation background music",
      waveColor: "from-green-400 to-emerald-400"
    },
    { 
      id: 19, 
      name: "Strength Training", 
      artist: "Weight Room", 
      tempo: 145, 
      energy: 8, 
      mood: ["heavy", "powerful", "rhythmic"], 
      correctPlaylist: 'workout',
      description: "Heavy track for strength training",
      waveColor: "from-red-400 to-orange-400"
    },
    { 
      id: 20, 
      name: "Code Focus", 
      artist: "Developer Beats", 
      tempo: 72, 
      energy: 4, 
      mood: ["technical", "flow", "concentrated"], 
      correctPlaylist: 'study',
      description: "Technical beats for coding focus",
      waveColor: "from-blue-400 to-cyan-400"
    },
  ];

  // User's training data
  const [userLabels, setUserLabels] = useState<Record<number, string>>({});
  const [aiPredictions, setAiPredictions] = useState<Record<number, string>>({});

  // Load starred state on mount
  useEffect(() => {
    const storageKey = `starred_numericals_${params.course}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const starred = new Set(JSON.parse(saved));
      setIsStarred(starred.has(params.id));
    }

    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params.id, params.course, isTimerRunning]);

  const toggleStar = () => {
    const storageKey = `starred_numericals_${params.course}`;
    const saved = localStorage.getItem(storageKey);
    const starred = saved ? new Set(JSON.parse(saved)) : new Set();

    if (isStarred) {
      starred.delete(params.id);
    } else {
      starred.add(params.id);
    }

    localStorage.setItem(storageKey, JSON.stringify(Array.from(starred)));
    setIsStarred(!isStarred);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    localStorage.setItem(`timer_${params.id}`, timer.toString());
    router.push(`/dashboard/${params.course}/numericals`);
  };

  // Calculator Logic
  const handleCalcInput = (btn: string) => {
    if (btn === "C") {
      setCalcDisplay("0");
      setCalcEquation("");
      return;
    }
    if (btn === "=") {
      try {
        // eslint-disable-next-line
        const result = eval(calcEquation + calcDisplay);
        setCalcDisplay(String(result).slice(0, 12));
        setCalcEquation("");
      } catch (e) {
        setCalcDisplay("Error");
      }
      return;
    }
    if (["+", "-", "*", "/"].includes(btn)) {
      setCalcEquation(calcDisplay + btn);
      setCalcDisplay("");
      return;
    }
    if (calcDisplay === "0" && btn !== ".") {
      setCalcDisplay(btn);
    } else {
      setCalcDisplay(prev => prev + btn);
    }
  };

  // Game functions
  const startGame = () => {
    setIsTimerRunning(true);
    setGamePhase('training');
    setCurrentSongIndex(0);
    setSolution(`// Spotify AI Training Log:\n// Phase 1: Training - Label songs to teach the AI\n// Song 1: ${trainingSongs[0].name}\n`);
  };

  const handleLabelSong = (playlistId: string) => {
    const currentSong = trainingSongs[currentSongIndex];
    const isCorrect = playlistId === currentSong.correctPlaylist;
    
    // Save user's label
    setUserLabels(prev => ({
      ...prev,
      [currentSong.id]: playlistId
    }));

    // Update workspace log
    const playlistName = playlists.find(p => p.id === playlistId)?.name;
    const correctName = playlists.find(p => p.id === currentSong.correctPlaylist)?.name;
    
    setSolution(prev => prev + `\n// Labeled "${currentSong.name}" as ${playlistName}\n// ${isCorrect ? '✅ Correct' : `❌ Recommended: ${correctName}`}\n`);

    // Show feedback
    setShowFeedback(true);
    setIsFeedbackCorrect(isCorrect);
    setFeedbackMessage(isCorrect ? 
      "✅ Correct! The AI learned from your classification." : 
      `❌ Recommended: ${correctName}. The AI will still learn your pattern.`);

    // Move to next song after delay
    setTimeout(() => {
      setShowFeedback(false);
      if (currentSongIndex < trainingSongs.length - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
        setSolution(prev => prev + `\n// Song ${currentSongIndex + 2}: ${trainingSongs[currentSongIndex + 1].name}\n`);
      } else {
        // Training complete, calculate rules
        calculateLearnedRules();
        setGamePhase('testing');
        setCurrentSongIndex(0);
        setSolution(prev => prev + `\n// Phase 2: Testing - AI makes predictions\n// Test Song 1: ${testSongs[0].name}\n`);
      }
    }, 1500);
  };

  const calculateLearnedRules = () => {
    // Collect all user-labeled songs
    const labeledSongs = trainingSongs.filter(song => userLabels[song.id]);
    
    // Calculate average features for each playlist
    const rules: any = {};
    
    playlists.forEach(playlist => {
      const playlistSongs = labeledSongs.filter(song => userLabels[song.id] === playlist.id);
      
      if (playlistSongs.length > 0) {
        const avgTempo = playlistSongs.reduce((sum, song) => sum + song.tempo, 0) / playlistSongs.length;
        const avgEnergy = playlistSongs.reduce((sum, song) => sum + song.energy, 0) / playlistSongs.length;
        const minTempo = Math.min(...playlistSongs.map(s => s.tempo));
        const maxTempo = Math.max(...playlistSongs.map(s => s.tempo));
        const minEnergy = Math.min(...playlistSongs.map(s => s.energy));
        const maxEnergy = Math.max(...playlistSongs.map(s => s.energy));
        
        rules[playlist.id] = {
          tempo: { avg: avgTempo, min: minTempo, max: maxTempo },
          energy: { avg: avgEnergy, min: minEnergy, max: maxEnergy },
          count: playlistSongs.length,
          songs: playlistSongs.map(s => s.name)
        };
      }
    });
    
    setLearnedRules(rules);
    
    // Log rules to workspace
    setSolution(prev => {
      let rulesLog = prev + `\n// AI Learned Rules Summary:\n`;
      Object.entries(rules).forEach(([playlistId, rule]: [string, any]) => {
        const playlist = playlists.find(p => p.id === playlistId);
        rulesLog += `// ${playlist?.name}: Tempo ${rule.tempo.avg.toFixed(0)} BPM, Energy ${rule.energy.avg.toFixed(1)}/10\n`;
      });
      return rulesLog;
    });
  };

  const aiPredict = (song: any) => {
    if (!learnedRules) return 'chill'; // Fallback
    
    let bestMatch = { playlist: 'chill', score: -Infinity };
    
    Object.entries(learnedRules).forEach(([playlistId, rule]: [string, any]) => {
      // Calculate similarity score based on tempo and energy
      const tempoDiff = Math.abs(song.tempo - rule.tempo.avg);
      const energyDiff = Math.abs(song.energy - rule.energy.avg);
      
      // Lower difference = better match
      const score = -(tempoDiff + energyDiff);
      
      if (score > bestMatch.score) {
        bestMatch = { playlist: playlistId, score };
      }
    });
    
    return bestMatch.playlist;
  };

  const handleTestPrediction = () => {
    const currentSong = testSongs[currentSongIndex];
    const aiPrediction = aiPredict(currentSong);
    const isCorrect = aiPrediction === currentSong.correctPlaylist;
    
    // Save AI prediction
    setAiPredictions(prev => ({
      ...prev,
      [currentSong.id]: aiPrediction
    }));

    const predictionName = playlists.find(p => p.id === aiPrediction)?.name;
    const correctName = playlists.find(p => p.id === currentSong.correctPlaylist)?.name;
    
    // Update workspace log
    setSolution(prev => prev + `\n// AI predicted: ${predictionName}\n// ${isCorrect ? '✅ Correct' : `❌ Actual: ${correctName}`}\n`);

    // Show feedback
    setShowFeedback(true);
    setIsFeedbackCorrect(isCorrect);
    setFeedbackMessage(isCorrect ? 
      `✅ AI predicted correctly: ${predictionName}` : 
      `❌ AI predicted ${predictionName}, but it's actually ${correctName}`);

    // Move to next song after delay
    setTimeout(() => {
      setShowFeedback(false);
      if (currentSongIndex < testSongs.length - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
        setSolution(prev => prev + `\n// Test Song ${currentSongIndex + 2}: ${testSongs[currentSongIndex + 1].name}\n`);
      } else {
        // Testing complete, calculate accuracy
        calculateAccuracy();
        setGamePhase('results');
        setShowResults(true);
      }
    }, 2000);
  };

  const calculateAccuracy = () => {
    // Calculate user accuracy during training - based on correct/total labels
    const trainingCorrect = trainingSongs.filter(song => 
      userLabels[song.id] === song.correctPlaylist
    ).length;
    const userAcc = (trainingCorrect / trainingSongs.length) * 100;
    setUserAccuracy(userAcc);

    // Calculate AI accuracy during testing - based on correct/total predictions
    const testCorrect = testSongs.filter(song => 
      aiPredictions[song.id] === song.correctPlaylist
    ).length;
    const aiAcc = (testCorrect / testSongs.length) * 100;
    setAiAccuracy(aiAcc);
    
    // Log final results to workspace
    setSolution(prev => prev + `\n// Final Results:\n// Your Labeling Accuracy: ${userAcc.toFixed(1)}% (${trainingCorrect}/${trainingSongs.length} correct)\n// AI Prediction Accuracy: ${aiAcc.toFixed(1)}% (${testCorrect}/${testSongs.length} correct)\n`);
  };

  const getCurrentSong = () => {
    if (gamePhase === 'training') return trainingSongs[currentSongIndex];
    if (gamePhase === 'testing') return testSongs[currentSongIndex];
    return trainingSongs[0];
  };

  const getProgress = () => {
    if (gamePhase === 'training') return ((currentSongIndex + 1) / trainingSongs.length) * 100;
    if (gamePhase === 'testing') return ((currentSongIndex + 1) / testSongs.length) * 100;
    return 0;
  };

  const getProgressText = () => {
    if (gamePhase === 'training') return `Training Song ${currentSongIndex + 1}/${trainingSongs.length}`;
    if (gamePhase === 'testing') return `Test Song ${currentSongIndex + 1}/${testSongs.length}`;
    return '';
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const currentSong = getCurrentSong();
  const recommendedLabel = getRecommendedLabel(currentSong.tempo, currentSong.energy);
  const recommendedPlaylist = playlists.find(p => p.id === recommendedLabel);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">Spotify Playlist Sorter</h1>
          <p className="text-sm text-textSecondary">Supervised Learning through Music Classification</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {gamePhase !== 'intro' && !showResults && (
            <>
              <button
                onClick={toggleStar}
                className="p-2 rounded-lg border border-white/10 bg-surface/40 hover:border-accent/40 hover:bg-accent/10 transition-all group"
                title={isStarred ? "Remove from important" : "Mark as important"}
              >
                <Star className={`w-5 h-5 ${isStarred ? 'fill-accent text-accent' : 'text-textSecondary group-hover:text-accent'} transition-colors`} />
              </button>
              <div className="text-right">
                <div className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">Time Elapsed</div>
                <div className="font-mono text-xl text-accent font-bold tabular-nums">{formatTime(timer)}</div>
              </div>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleExit}
          >
            {showResults ? "Done" : "Exit"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!showResults ? (
          gamePhase === 'intro' ? (
            <div className="flex flex-col lg:grid lg:grid-cols-12 h-fit lg:h-full">
              {/* Column 1: Introduction */}
              <div className="w-full lg:col-span-3 bg-surface/30 border-r border-white/5 p-6 overflow-y-auto max-h-[40vh] lg:max-h-full shrink-0">
                <Badge variant="warning" className="mb-4">Interactive Learning</Badge>
                <h2 className="text-xl font-bold mb-4 text-textPrimary">How Spotify's AI Learns</h2>
                <p className="text-sm text-textSecondary leading-relaxed mb-6">
                  Train your own AI to sort songs into playlists. The AI learns patterns from YOUR decisions and adapts to your classification style.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                    <h3 className="font-bold text-blue-300 mb-1">🎯 What This Game Does</h3>
                    <ul className="text-xs text-textSecondary space-y-1">
                      <li>• Teaches Supervised Learning through music classification</li>
                      <li>• Students train an AI to sort songs into playlists</li>
                      <li>• Shows how Spotify's real recommendation system works</li>
                      <li>• Makes abstract ML concepts tangible and fun</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold text-textPrimary mb-3">🎮 Game Flow</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-bold text-white">1</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-textPrimary">Phase 1: Training (15 Songs)</h4>
                        <p className="text-xs text-textSecondary">Label songs. AI learns from your patterns.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-bold text-white">2</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-textPrimary">Phase 2: Testing (5 Songs)</h4>
                        <p className="text-xs text-textSecondary">AI predicts based on what it learned.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-bold text-white">3</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-textPrimary">Phase 3: Results</h4>
                        <p className="text-xs text-textSecondary">See accuracy and what rules AI learned.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Hint */}
                <div className="mt-auto">
                  <div
                    className="flex justify-between items-center cursor-pointer p-2 rounded-lg select-none hover:bg-accent/10 transition-colors"
                    onClick={() => setHintOpen(!hintOpen)}
                  >
                    <span className="text-xs font-bold text-accent">KEY CONCEPT</span>
                    <span
                      className={`transition-transform duration-300 ease-in-out transform ${hintOpen ? "rotate-180" : "rotate-0"}`}
                    >
                      {hintOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  </div>
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${hintOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}`}
                  >
                    <div className="p-3 border-l-2 border-accent text-xs text-textSecondary">
                      The AI learns EXACTLY what you teach it. If you label slow songs as "Party Mode," it will think slow = party!
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Workspace */}
              <div className="w-full lg:col-span-6 bg-[#0F0E0D] relative flex flex-col min-h-[50vh] lg:min-h-full">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className={showCalculator ? "bg-accent text-background hover:bg-accentHover" : ""}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Calculator</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setWorkspaceTheme(workspaceTheme === 'dark' ? 'light' : 'dark')}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    {workspaceTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setSolution('// Spotify AI Training Log:\n')}>
                    Clear
                  </Button>
                </div>

                {showCalculator && (
                  <Card className="absolute top-16 right-4 z-20 w-64 bg-surface border border-white/10 shadow-2xl p-4 animate-in zoom-in-95 duration-200 select-none">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                      <span className="text-xs font-bold uppercase text-textSecondary">Calculator</span>
                      <button onClick={() => setShowCalculator(false)} className="text-textSecondary hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="bg-black/40 p-3 rounded text-right font-mono text-xl mb-3 text-white overflow-hidden text-ellipsis">
                      <div className="text-xs text-textSecondary h-4">{calcEquation}</div>
                      {calcDisplay}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '.', '+'].map(btn => (
                        <button
                          key={btn}
                          onClick={() => btn === 'C' ? handleCalcInput('C') : handleCalcInput(btn)}
                          className={`h-10 w-full rounded text-sm font-bold transition-colors ${['/', '*', '-', '+'].includes(btn) ? 'bg-accent/20 text-accent hover:bg-accent/30' :
                            btn === 'C' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                              'bg-white/5 hover:bg-white/10 text-white'
                            }`}
                        >
                          {btn}
                        </button>
                      ))}
                      <button onClick={() => handleCalcInput('=')} className="col-span-4 h-10 bg-accent text-background font-bold rounded hover:bg-accentHover mt-2">=</button>
                    </div>
                  </Card>
                )}

                <textarea
                  ref={textAreaRef}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className={cn(
                    "flex-1 w-full p-6 md:p-8 font-mono resize-none focus:outline-none text-sm leading-7 transition-colors duration-300",
                    workspaceTheme === 'dark' ? "bg-transparent text-white" : "bg-white text-black"
                  )}
                  placeholder="// AI training log will appear here..."
                  readOnly
                />
              </div>

              {/* Column 3: Start Game & Info */}
              <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
                <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Playlist Categories</h3>

                <div className="space-y-4 mb-8">
                  {playlists.map(playlist => (
                    <div 
                      key={playlist.id} 
                      className={`p-4 rounded-xl border ${playlist.border} ${playlist.color}`}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{playlist.icon}</span>
                        <h4 className={`font-bold ${playlist.textColor}`}>{playlist.name}</h4>
                      </div>
                      <p className="text-xs text-textSecondary">
                        {playlist.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-4">
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <h4 className="font-bold text-accent mb-2 text-sm">🎯 Educational Goal</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      Learn how supervised learning algorithms work by creating your own training data and watching the AI learn from YOUR patterns.
                    </p>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20"
                    onClick={startGame}
                  >
                    <Play className="w-5 h-5" />
                    Start Training Your AI
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-12 h-fit lg:h-full">
              {/* Column 1: Current Song Info */}
              <div className="w-full lg:col-span-4 bg-surface/30 border-r border-white/5 p-6 overflow-y-auto">
                <Badge variant={gamePhase === 'training' ? "warning" : "success"} className="mb-4">
                  {gamePhase === 'training' ? `Training Phase - Song ${currentSongIndex + 1}/15` : `Testing Phase - Song ${currentSongIndex + 1}/5`}
                </Badge>
                
                <div 
                  className="relative mb-6"
                  onMouseEnter={() => setShowRecommended(true)}
                  onMouseLeave={() => setShowRecommended(false)}
                >
                  <h2 className="text-xl font-bold mb-1 text-textPrimary">{currentSong.name}</h2>
                  <p className="text-textSecondary">{currentSong.artist}</p>
                  
                  {/* Recommended Label Tooltip */}
                  {showRecommended && (
                    <div className="absolute top-0 left-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-white/20 z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center mb-2">
                        <Brain className="w-4 h-4 text-accent mr-2" />
                        <span className="text-xs font-bold text-accent">AI Recommendation</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{recommendedPlaylist?.icon}</span>
                        <div>
                          <p className="font-bold text-white">{recommendedPlaylist?.name}</p>
                          <p className="text-xs text-textSecondary">
                            Based on thresholds: {recommendedPlaylist?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Audio Visualizer */}
                <AudioVisualizer 
                  songName={currentSong.name}
                  tempo={currentSong.tempo}
                  energy={currentSong.energy}
                />
                
                {/* Song Description */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="font-bold text-textPrimary mb-2 text-sm">🎵 Track Description</h3>
                  <p className="text-sm text-textSecondary">{currentSong.description}</p>
                </div>

                {/* Song Features */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-sm text-textSecondary">Tempo</span>
                    </div>
                    <div className="font-mono font-bold text-lg text-textPrimary">{currentSong.tempo} BPM</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                      <span className="text-sm text-textSecondary">Energy Level</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-white/10 rounded-full h-2 mr-3">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
                          style={{ width: `${currentSong.energy * 10}%` }}
                        />
                      </div>
                      <div className="font-mono font-bold text-lg text-textPrimary">{currentSong.energy}/10</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Brain className="w-4 h-4 mr-2 text-green-400" />
                      <span className="text-sm text-textSecondary">Mood Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentSong.mood.map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-textSecondary">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs text-textSecondary mb-1">
                    <span>{getProgressText()}</span>
                    <span>{Math.round(getProgress())}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-accent h-full rounded-full transition-all duration-500"
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Workspace */}
              <div className="w-full lg:col-span-5 bg-[#0F0E0D] relative flex flex-col min-h-[50vh] lg:min-h-full">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className={showCalculator ? "bg-accent text-background hover:bg-accentHover" : ""}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Calculator</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setWorkspaceTheme(workspaceTheme === 'dark' ? 'light' : 'dark')}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    {workspaceTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </Button>
                </div>

                <textarea
                  ref={textAreaRef}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className={cn(
                    "flex-1 w-full p-6 md:p-8 font-mono resize-none focus:outline-none text-sm leading-7 transition-colors duration-300",
                    workspaceTheme === 'dark' ? "bg-transparent text-white" : "bg-white text-black"
                  )}
                  placeholder="// AI training log will appear here..."
                  readOnly
                />
              </div>

              {/* Column 3: Playlist Selection */}
              <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
                <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">
                  {gamePhase === 'training' ? 
                    "Select Playlist for this Song" : 
                    "AI's Prediction for this Song"}
                </h3>

                {/* Feedback Display */}
                {showFeedback && (
                  <div className={`p-4 rounded-xl border mb-6 ${
                    isFeedbackCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                  } animate-in slide-in-from-bottom duration-300`}>
                    <div className="flex items-center">
                      {isFeedbackCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mr-2" />
                      )}
                      <span className={isFeedbackCorrect ? 'text-green-400' : 'text-red-400'}>
                        {feedbackMessage}
                      </span>
                    </div>
                  </div>
                )}

                {/* Playlist Selection Grid */}
                <div className="space-y-4 mb-8 flex-1">
                  {playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => gamePhase === 'training' ? handleLabelSong(playlist.id) : null}
                      className={`p-5 rounded-2xl border ${playlist.border} ${playlist.color} w-full text-left transition-all duration-300 ${
                        gamePhase === 'training' ? 'hover:scale-105 hover:border-white/50 cursor-pointer' : 'cursor-default'
                      } ${
                        gamePhase === 'testing' && aiPredictions[currentSong.id] === playlist.id ? 
                        'ring-2 ring-accent ring-offset-2 ring-offset-surface/30' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">{playlist.icon}</span>
                        <div>
                          <h4 className={`font-bold text-lg ${playlist.textColor}`}>{playlist.name}</h4>
                          <p className="text-xs text-textSecondary mt-1">
                            {playlist.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  {gamePhase === 'testing' ? (
                    <Button 
                      size="lg" 
                      className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20"
                      onClick={handleTestPrediction}
                      disabled={showFeedback}
                    >
                      <Brain className="w-5 h-5" />
                      Let AI Predict This Song
                    </Button>
                  ) : (
                    <div className="text-center text-textSecondary text-sm p-4 bg-white/5 rounded-lg border border-white/10">
                      Click a playlist above to train your AI
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          /* Results View */
          <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Result Hero */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl bg-accent shadow-accent/20">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black text-textPrimary mb-2">Training Complete!</h2>
              <p className="text-textSecondary text-lg max-w-xl">
                Your AI learned from your labeling patterns. Here's how it performed.
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Your Labeling Accuracy</div>
                <div className="text-2xl font-bold text-textPrimary mb-1">{userAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-textSecondary mb-2">
                  {Math.round(userAccuracy/100 * trainingSongs.length)}/{trainingSongs.length} correct
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${userAccuracy}%` }}
                  />
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">AI Prediction Accuracy</div>
                <div className="text-2xl font-bold text-textPrimary mb-1">{aiAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-textSecondary mb-2">
                  {Math.round(aiAccuracy/100 * testSongs.length)}/{testSongs.length} correct
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${aiAccuracy}%` }}
                  />
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Training Time</div>
                <div className="text-2xl font-bold text-textPrimary mb-1">{formatTime(timer)}</div>
              </Card>
            </div>

            {/* What the AI Learned */}
            {learnedRules && (
              <Card className="p-8 bg-surface/20 border border-white/5 mb-12">
                <h3 className="text-xl font-bold text-textPrimary mb-6">What Your AI Learned</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {playlists.map(playlist => {
                    const rule = learnedRules[playlist.id];
                    if (!rule) return null;
                    
                    return (
                      <div key={playlist.id} className={`p-4 rounded-xl border ${playlist.border} ${playlist.color}`}>
                        <h4 className="font-bold text-textPrimary mb-3 flex items-center">
                          <span className="mr-2">{playlist.icon}</span>
                          {playlist.name}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-textSecondary">Avg. Tempo:</span>
                            <span className="font-mono font-bold text-textPrimary">{rule.tempo.avg.toFixed(0)} BPM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-textSecondary">Avg. Energy:</span>
                            <span className="font-mono font-bold text-textPrimary">{rule.energy.avg.toFixed(1)}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-textSecondary">Training Examples:</span>
                            <span className="font-bold text-textPrimary">{rule.count} songs</span>
                          </div>
                          {rule.songs.length > 0 && (
                            <div className="mt-3">
                              <p className="text-textSecondary text-xs mb-1">Examples you labeled:</p>
                              <p className="text-xs text-textSecondary truncate">{rule.songs.slice(0, 3).join(', ')}...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20">
                  <h4 className="text-xs font-bold text-accent mb-2 uppercase">How Supervised Learning Works</h4>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    The AI learned patterns from YOUR labels, even if they weren't always "correct." 
                    If you labeled mostly slow songs as "Party Mode," the AI learned that association.
                    Real Spotify algorithms work similarly—they learn from user behavior patterns!
                  </p>
                </div>
              </Card>
            )}

            {/* Test Results */}
            <Card className="p-6 bg-surface/30 border border-white/5 mb-12">
              <h3 className="font-bold text-textPrimary mb-4">Test Song Predictions</h3>
              <div className="space-y-3">
                {testSongs.map(song => {
                  const aiPrediction = aiPredictions[song.id];
                  const isCorrect = aiPrediction === song.correctPlaylist;
                  
                  return (
                    <div key={song.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-textPrimary">{song.name}</div>
                        <div className="text-xs text-textSecondary">{song.artist}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-textSecondary">AI Predicted:</div>
                          <div className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {playlists.find(p => p.id === aiPrediction)?.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-textSecondary">Actual:</div>
                          <div className="font-bold text-textPrimary">
                            {playlists.find(p => p.id === song.correctPlaylist)?.name}
                          </div>
                        </div>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Bottom Navigation */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 border-t border-white/5">
              <div className="flex gap-4 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={() => {
                    setShowResults(false);
                    setGamePhase('intro');
                    setTimer(0);
                    setUserLabels({});
                    setAiPredictions({});
                    setLearnedRules(null);
                    setSolution(`// Spotify AI Training Log:\n// This AI learns patterns from YOUR music classification decisions.\n`);
                  }}
                >
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={handleExit}
                >
                  Continue Journey
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}