import React, { useState } from 'react';
import { Send, Phone, Video, Calendar, Paperclip, Search, MoreVertical } from 'lucide-react';

const CoachCommunication = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      coach: {
        name: "Dr. Emily Chen",
        specialty: "Life Coaching",
        avatar: "/api/placeholder/40/40",
        status: "online"
      },
      lastMessage: "Great progress on your work-life balance goals! Let's schedule a follow-up session.",
      lastMessageTime: "2 hours ago",
      unreadCount: 2,
      messages: [
        {
          id: 1,
          sender: "coach",
          message: "Hi Sarah! I hope you're doing well. How did the meditation exercises go this week?",
          timestamp: "2025-01-15T10:30:00",
          read: true
        },
        {
          id: 2,
          sender: "client",
          message: "Hi Dr. Chen! They went really well. I managed to do them 5 out of 7 days this week.",
          timestamp: "2025-01-15T11:15:00",
          read: true
        },
        {
          id: 3,
          sender: "coach",
          message: "That's fantastic! You're making excellent progress. I noticed you completed the work boundary milestone too.",
          timestamp: "2025-01-15T11:20:00",
          read: true
        },
        {
          id: 4,
          sender: "client", 
          message: "Yes! It's been challenging but I'm finally able to leave work at 6 PM most days.",
          timestamp: "2025-01-15T11:25:00",
          read: true
        },
        {
          id: 5,
          sender: "coach",
          message: "Great progress on your work-life balance goals! Let's schedule a follow-up session.",
          timestamp: "2025-01-15T14:30:00",
          read: false
        }
      ]
    },
    {
      id: 2,
      coach: {
        name: "Michael Rodriguez",
        specialty: "Career Development",
        avatar: "/api/placeholder/40/40",
        status: "offline"
      },
      lastMessage: "Don't forget to prepare your presentation for next week's session.",
      lastMessageTime: "1 day ago",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: "coach",
          message: "Hi Sarah! How's the preparation for your executive presentation going?",
          timestamp: "2025-01-14T09:00:00",
          read: true
        },
        {
          id: 2,
          sender: "client",
          message: "It's coming along well. I've outlined the key points and started working on the slides.",
          timestamp: "2025-01-14T10:30:00",
          read: true
        },
        {
          id: 3,
          sender: "coach",
          message: "Don't forget to prepare your presentation for next week's session.",
          timestamp: "2025-01-14T16:45:00",
          read: true
        }
      ]
    },
    {
      id: 3,
      coach: {
        name: "Sarah Williams",
        specialty: "Wellness Coaching",
        avatar: "/api/placeholder/40/40",
        status: "away"
      },
      lastMessage: "How are the new nutrition habits working out for you?",
      lastMessageTime: "3 days ago",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: "coach",
          message: "Hi! I wanted to check in on your nutrition goals. How are the new habits working out for you?",
          timestamp: "2025-01-12T14:00:00",
          read: true
        },
        {
          id: 2,
          sender: "client",
          message: "They're going well! Meal prep on Sundays has been a game-changer.",
          timestamp: "2025-01-12T15:20:00",
          read: true
        }
      ]
    }
  ];

  const activeConversation = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Here you would send the message to your backend
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-yellow-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.coach.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-[700px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg mb-3">Messages</h3>
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedChat(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat === conversation.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={conversation.coach.avatar}
                    alt={conversation.coach.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.coach.status)}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{conversation.coach.name}</h4>
                    <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{conversation.coach.specialty}</div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>

                {conversation.unreadCount > 0 && (
                  <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={activeConversation.coach.avatar}
                  alt={activeConversation.coach.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(activeConversation.coach.status)}`} />
              </div>
              <div>
                <h4 className="font-medium">{activeConversation.coach.name}</h4>
                <p className="text-sm text-gray-500">{activeConversation.coach.specialty}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Calendar size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'client'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'client' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip size={20} className="text-gray-600" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className={`p-2 rounded-lg ${
                  messageText.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
            <p className="text-gray-500">Choose a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachCommunication;