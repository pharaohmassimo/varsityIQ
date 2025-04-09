"use client";
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED'
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant'
  content: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === 'transcript') {
        setMessages((prev) => {
          if (message.transcriptType === 'partial') {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            if (lastIndex >= 0 && newMessages[lastIndex].role === message.role) {
              newMessages[lastIndex] = {
                role: message.role,
                content: message.transcript
              };
              return newMessages;
            }
          }
          return [...prev, {
            role: message.role,
            content: message.transcript
          }];
        });
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error("VAPI Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      const timer = setTimeout(() => router.push('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [callStatus, router]);

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: { username: userName, userid: userId }
      });
    } catch (error) {
      console.error('Call failed:', error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
  
  return (

    <>
      <div className="call-view">
        <div className='card-interviewer'>
            <div className='avatar'>
                <Image 
                src="/ai-avatar.png"
                alt="vapi"
                width={65}
                height={54}
                className="object-cover"
                />
                {isSpeaking && <span className='animate-speak'/>}
                
            </div>
            <h3>Tino</h3>
        </div>
  

        <div className='card-border'>
          <div className='card-content'>
              <Image 
                src="/user-avatar.png"
                alt="user avatar"
                width={540}
                height={540}
                className='rounded-full object-cover size-[120px]'
              />
              <h3>
                {userName}
              </h3>
          </div>
        </div>
    </div> 

              {messages.length > 0 && (
              <div className='transcript-border'>
                <div className='transcript'>
                  <p className="animate-fadeIn transition-opacity duration-500 truncate whitespace-nowrap overflow-hidden">
                    <span className="font-semibold">
                      {messages[messages.length - 1].role === 'user' ? 'You: ' : 'Interviewer: '}
                    </span>
                    {messages[messages.length - 1].content}
                  </p>
                </div>
              </div>
            )}


          <div className='w-full flex justify-center'>
          {callStatus !== 'ACTIVE' ? (
              <button className='relative btn-call' onClick={handleCall}>
                <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== 'CONNECTING' && 'hidden')} />
                
                <span>
                    {isCallInactiveOrFinished ? 'CALL' : '...'}
                </span>
              </button>
            ) : (
              <button className="btn-disconnect" onClick={handleDisconnect}>
                End
              </button>
            )}
          </div>
    </>
    
  );
};

export default Agent;
