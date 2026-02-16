import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCallProps {
  userId: string;
  userName: string;
  userProfilePicture?: string;
  onClose: () => void;
  onCallEnd?: () => void;
}

export function VideoCall({ userId, userName, userProfilePicture, onClose, onCallEnd }: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('ringing');
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsCallActive(true);
        setCallStatus('active');
      };

      // Handle ICE candidates (for connection establishment)
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real app, you'd send this to the other peer via signaling server
          // For now, we'll simulate a connection
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Simulate call acceptance after 2 seconds
      setTimeout(() => {
        setCallStatus('active');
        setIsCallActive(true);
      }, 2000);

    } catch (err: any) {
      console.error('Error initializing call:', err);
      setError(err.message || 'Failed to start video call');
      setCallStatus('ended');
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const handleMuteToggle = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = () => {
    cleanup();
    setCallStatus('ended');
    if (onCallEnd) {
      onCallEnd();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full h-full max-w-7xl max-h-[90vh] flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEndCall}
            className="absolute top-4 right-4 z-10 !text-white hover:!bg-white/20 bg-transparent"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Video containers */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Remote video (other person) */}
            <div className="absolute inset-0 w-full h-full">
              {callStatus === 'active' && isCallActive ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
                      <AvatarImage src={userProfilePicture} />
                      <AvatarFallback className="bg-white/10 text-white text-4xl">
                        {userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white text-xl mb-2">{userName}</p>
                    <p className="text-white/70">
                      {callStatus === 'ringing' ? 'Calling...' : callStatus === 'connecting' ? 'Connecting...' : 'Call ended'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Local video (yourself) - Picture in picture */}
            {callStatus === 'active' && (
              <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/30 bg-black">
                {!isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/50 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-white/50" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Call controls */}
          {callStatus === 'active' && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
              <Button
                size="lg"
                variant="outline"
                onClick={handleMuteToggle}
                className={`rounded-full w-14 h-14 !border-white/30 ${
                  isMuted ? '!bg-red-500/20 !border-red-500/50' : '!bg-white/10 !text-white hover:!bg-white/20'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleVideoToggle}
                className={`rounded-full w-14 h-14 !border-white/30 ${
                  isVideoOff ? '!bg-red-500/20 !border-red-500/50' : '!bg-white/10 !text-white hover:!bg-white/20'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </Button>

              <Button
                size="lg"
                onClick={handleEndCall}
                className="rounded-full w-14 h-14 !bg-red-600 hover:!bg-red-700 !text-white"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 text-white text-sm">
              {error}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

