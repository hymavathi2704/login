import React, { useState } from 'react';
import { 
  Send, 
  Search, 
  Filter, 
  Users, 
  Mail, 
  MessageSquare, 
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Paperclip
} from 'lucide-react';

const CommunicationCenter = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      client: {
        name: "Sarah Johnson",
        avatar: "/api/placeholder/40/40",
        status: "online"
      },
      lastMessage: "Thank you for the meditation exercises! They're really helping.",
      lastMessageTime: "10 minutes ago",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: "client",
          message: "Hi Dr. Chen! I wanted to update you on my progress this week.",
          timestamp: "2025-01-15T09:30:00",
          read: true
        },
        {
          id: 2,
          sender: "coach",
          message: "That's great to hear! How did the work boundary exercises go?",
          timestamp: "2025-01-15T09:35:00",
          read: true
        },
        {
          id: 3,
          sender: "client",
          message: "Much better! I managed to leave work on time 4 out of 5 days this week.",
          timestamp: "2025-01-15T09:40:00",
          read: true
        },
        {
          id: 4,
          sender: "coach",
          message: "Excellent progress! Let's build on that momentum. I'm sending you some additional meditation exercises.",
          timestamp: "2025-01-15T09:45:00",
          read: true
        },
        {
          id: 5,
          sender: "client",
          message: "Thank you for the meditation exercises! They're really helping.",
          timestamp: "2025-01-15T10:20:00",
          read: true
        }
      ]
    },
    {
      id: 2,
      client: {
        name: "Michael Chen",
        avatar: "/api/placeholder/40/40",
        status: "away"
      },
      lastMessage: "When should we schedule the presentation practice session?",
      lastMessageTime: "2 hours ago",
      unreadCount: 2,
      messages: [
        {
          id: 1,
          sender: "client",
          message: "Hi! I've finished preparing the outline for my executive presentation.",
          timestamp: "2025-01-15T08:00:00",
          read: true
        },
        {
          id: 2,
          sender: "client",
          message: "When should we schedule the presentation practice session?",
          timestamp: "2025-01-15T08:15:00",
          read: false
        }
      ]
    },
    {
      id: 3,
      client: {
        name: "Emma Wilson",
        avatar: "/api/placeholder/40/40",
        status: "offline"
      },
      lastMessage: "The nutrition plan is working great! I have more energy.",
      lastMessageTime: "1 day ago",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: "client",
          message: "The nutrition plan is working great! I have more energy.",
          timestamp: "2025-01-14T16:30:00",
          read: true
        },
        {
          id: 2,
          sender: "coach",
          message: "That's wonderful! Keep up the great work. How are the stress management techniques going?",
          timestamp: "2025-01-14T17:00:00",
          read: true
        }
      ]
    }
  ];

  const automatedMessages = [
    {
      id: 1,
      type: "reminder",
      title: "Session Reminder - 24 Hours",
      status: "active",
      sent: 15,
      scheduled: "24 hours before session",
      lastSent: "2025-01-14T10:00:00",
      template: "Hi [CLIENT_NAME], this is a reminder about your upcoming coaching session tomorrow at [SESSION_TIME]. Looking forward to our conversation!"
    },
    {
      id: 2,
      type: "confirmation",
      title: "Booking Confirmation",
      status: "active", 
      sent: 8,
      scheduled: "Immediately after booking",
      lastSent: "2025-01-13T14:30:00",
      template: "Thank you for booking a session with me, [CLIENT_NAME]! Your session is confirmed for [SESSION_DATE] at [SESSION_TIME]. I'll send you the meeting link 1 hour before our session."
    },
    {
      id: 3,
      type: "followup",
      title: "Post-Session Follow-up",
      status: "active",
      sent: 22,
      scheduled: "2 hours after session",
      lastSent: "2025-01-12T18:30:00",
      template: "Hi [CLIENT_NAME], thank you for our session today! I've uploaded your action items and resources to your dashboard. Feel free to reach out if you have any questions."
    }
  ];

  const bulkMessages = [
    {
      id: 1,
      title: "Monthly Newsletter - January 2025",
      recipients: 24,
      status: "sent",
      sentAt: "2025-01-01T09:00:00",
      subject: "New Year, New You: Setting Intentions for 2025"
    },
    {
      id: 2,
      title: "Workshop Announcement - Leadership Skills",
      recipients: 18,
      status: "scheduled",
      scheduledFor: "2025-01-16T10:00:00",
      subject: "Exclusive Workshop: Leadership Skills for Emerging Managers"
    }
  ];

  const activeConversation = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
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

  const renderMessages = () => (
    <div className="bg-white rounded-xl border border-gray-200 h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg mb-3">Messages</h3>
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-purple-50 border-r-2 border-r-purple-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={conversation.client.avatar}
                    alt={conversation.client.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.client.status)}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{conversation.client.name}</h4>
                    <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>

                {conversation.unreadCount > 0 && (
                  <div className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversation && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={activeConversation.client.avatar}
                  alt={activeConversation.client.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(activeConversation.client.status)}`} />
              </div>
              <div>
                <h4 className="font-medium">{activeConversation.client.name}</h4>
                <p className="text-sm text-gray-500">
                  {activeConversation.client.status === 'online' ? 'Online' : 
                   activeConversation.client.status === 'away' ? 'Away' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Calendar size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'coach' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'coach'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'coach' ? 'text-purple-100' : 'text-gray-500'
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

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip size={20} className="text-gray-600" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className={`p-2 rounded-lg ${
                  messageText.trim()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Automated Messages</h3>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
          <Plus size={20} />
          <span>Create Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {automatedMessages.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium text-lg">{template.title}</h4>
                <p className="text-sm text-gray-500">{template.type}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {template.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>{template.scheduled}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Send size={16} />
                <span>{template.sent} messages sent</span>
              </div>
              {template.lastSent && (
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Last sent: {new Date(template.lastSent).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700">{template.template}</p>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm">
                Edit
              </button>
              <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBulkMessages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bulk Messaging</h3>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
          <Plus size={20} />
          <span>Create Campaign</span>
        </button>
      </div>

      <div className="space-y-4">
        {bulkMessages.map((campaign) => (
          <div key={campaign.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-lg mb-2">{campaign.title}</h4>
                <p className="text-gray-600 mb-2">{campaign.subject}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>{campaign.recipients} recipients</span>
                  </div>
                  {campaign.status === 'sent' && campaign.sentAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} />
                      <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {campaign.status === 'scheduled' && campaign.scheduledFor && (
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>Scheduled: {new Date(campaign.scheduledFor).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {campaign.status}
                </span>
                <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication Center</h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare size={16} className="inline mr-2" />
            Messages
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'automation'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertCircle size={16} className="inline mr-2" />
            Automation
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bulk'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            Bulk Messages
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'messages' && renderMessages()}
      {activeTab === 'automation' && renderAutomation()}
      {activeTab === 'bulk' && renderBulkMessages()}
    </div>
  );
};

export default CommunicationCenter;