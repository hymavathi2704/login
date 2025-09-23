import React, { useState } from 'react';
import { BookOpen, Download, Eye, Video, FileText, Headphones, Filter, Search } from 'lucide-react';

const MyResources = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resources = [
    {
      id: 1,
      title: "Goal Setting Workbook",
      description: "A comprehensive guide to setting and achieving your personal and professional goals.",
      type: "pdf",
      category: "Life Coaching",
      coach: "Dr. Emily Chen",
      dateAdded: "2025-01-10",
      size: "2.3 MB",
      downloads: 15,
      status: "new"
    },
    {
      id: 2,
      title: "Meditation Exercises Collection",
      description: "10 guided meditation exercises for stress relief and mindfulness practice.",
      type: "audio",
      category: "Wellness",
      coach: "Sarah Williams",
      dateAdded: "2025-01-08",
      size: "45 MB",
      downloads: 8,
      status: "accessed"
    },
    {
      id: 3,
      title: "Career Development Roadmap",
      description: "Strategic planning template for advancing your career in the next 5 years.",
      type: "pdf",
      category: "Career Development",
      coach: "Michael Rodriguez",
      dateAdded: "2025-01-05",
      size: "1.8 MB",
      downloads: 12,
      status: "completed"
    },
    {
      id: 4,
      title: "Leadership Skills Masterclass",
      description: "Video series on developing essential leadership skills in the modern workplace.",
      type: "video",
      category: "Business Coaching",
      coach: "Michael Rodriguez",
      dateAdded: "2025-01-03",
      size: "380 MB",
      downloads: 3,
      status: "in-progress"
    },
    {
      id: 5,
      title: "Nutrition Planning Guide",
      description: "Complete guide to meal planning and nutrition for optimal health and energy.",
      type: "pdf",
      category: "Wellness",
      coach: "Sarah Williams",
      dateAdded: "2024-12-28",
      size: "5.2 MB",
      downloads: 22,
      status: "completed"
    },
    {
      id: 6,
      title: "Time Management Techniques",
      description: "Audio course covering proven techniques for better time management and productivity.",
      type: "audio",
      category: "Life Coaching", 
      coach: "Dr. Emily Chen",
      dateAdded: "2024-12-25",
      size: "67 MB",
      downloads: 18,
      status: "accessed"
    }
  ];

  const categories = [...new Set(resources.map(r => r.category))];

  const filteredResources = resources.filter(resource => {
    const matchesFilter = filter === 'all' || resource.type === filter;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'audio':
        return Headphones;
      default:
        return BookOpen;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'accessed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <h2 className="text-2xl font-bold">My Resources</h2>
          <div className="text-sm text-gray-500">
            {filteredResources.length} of {resources.length} resources
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type);
          
          return (
            <div key={resource.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TypeIcon size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{resource.category}</div>
                    <div className="text-xs text-gray-400">by {resource.coach}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(resource.status)}`}>
                  {resource.status}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{new Date(resource.dateAdded).toLocaleDateString()}</span>
                <span>{resource.size}</span>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <Download size={16} />
                </button>
              </div>

              {resource.status === 'in-progress' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MyResources;