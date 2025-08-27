declare module '*.jsx' {
  const content: any;
  export default content;
}

declare module '*.js' {
  const content: any;
  export default content;
}

// Socket.io types
declare module 'socket.io-client' {
  export * from 'socket.io-client';
}

// React component types
declare module 'react' {
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
  }
}

// Global types for the app
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Skill {
  _id: string;
  name: string;
  description: string;
  rate: number;
  experienceLevel: string;
  category: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  location: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  skillId: string;
  content: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

// Socket event types
interface SocketEvents {
  'message:new': (message: Message) => void;
  'message:update': (message: Message) => void;
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
} 