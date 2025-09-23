import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Folder, 
  File, 
  FileText, 
  Video, 
  Headphones, 
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  Plus,
  Users,
  Lock,
  Unlock
} from 'lucide-react';

const ResourcesLibrary = () => {
  const [currentFolder, setCurrentFolder] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const folders = [
    {
      id: 'life-coaching',
      name: 'Life Coaching Materials',
      description: 'Resources for work-life balance and personal growth',
      itemCount: 12,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'career-development', 
      name: 'Career Development',
      description: 'Leadership, career planning, and professional growth resources',
      itemCount: 8,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'wellness',
      name: 'Wellness & Mindfulness',
      description: 'Meditation, nutrition, and stress management resources',
      itemCount: 15,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'templates',
      name: 'Templates & Worksheets',
      description: 'Reusable templates for client exercises and assessments',
      itemCount: 6,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const resources = [
    {
      id: 1,
      name: "Goal Setting Workbook.pdf",
      type: "pdf",
      size: "2.3 MB",
      folder: "life-coaching",
      uploadDate: "2025-01-10",
      sharedWith: ["Sarah Johnson", "Michael Chen"],
      accessLevel: "selected",
      downloads: 15,
      description: "Comprehensive workbook for setting and tracking personal goals"
    },
    {
      id: 2,
      name: "Meditation Exercises Collection.zip",
      type: "audio",
      size: "45 MB",
      folder: "wellness",
      uploadDate: "2025-01-08",
      sharedWith: ["All Wellness Clients"],
      accessLevel: "category",
      downloads: 28,
      description: "10 guided meditation exercises for stress relief"
    },
    {
      id: 3,
      name: "Leadership Assessment Template.docx",
      type: "document",
      size: "1.2 MB",
      folder: "templates",
      uploadDate: "2025-01-05",
      sharedWith: ["Private"],
      accessLevel: "private",
      downloads: 0,
      description: "360-degree leadership assessment template"
    },
    {
      id: 4,
      name: "Career Planning Masterclass.mp4",
      type: "video",
      size: "380 MB",
      folder: "career-development",
      uploadDate: "2025-01-03",
      sharedWith: ["Michael Chen", "David Rodriguez"],
      accessLevel: "selected",
      downloads: 12,
      description: "Comprehensive video guide for career planning and development"
    },
    {
      id: 5,
      name: "Nutrition Planning Guide.pdf",
      type: "pdf",
      size: "5.2 MB",
      folder: "wellness",
      uploadDate: "2024-12-28",
      sharedWith: ["All Clients"],
      accessLevel: "all",
      downloads: 42,
      description: "Complete guide to meal planning and nutritional wellness"
    },
    {
      id: 6,
      name: "Time Management Techniques.pdf",
      type: "pdf",
      size: "1.8 MB",
      folder: "life-coaching",
      uploadDate: "2024-12-25",
      sharedWith: ["Sarah Johnson", "Emma Wilson"],
      accessLevel: "selected",
      downloads: 18,
      description: "Proven techniques for better time management and productivity"
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'video':
        return Video;
      case 'audio':
        return Headphones;
      default:
        return File;
    }
  };

  const getAccessIcon = (accessLevel) => {
    switch (accessLevel) {
      case 'all':
        return Unlock;
      case 'category':
        return Users;
      case 'selected':
        return Users;
      case 'private':
        return Lock;
      default:
        return Lock;
    }
  };

  const getAccessColor = (accessLevel) => {
    switch (accessLevel) {
      case 'all':
        return 'text-green-600';
      case 'category':
        return 'text-blue-600';
      case 'selected':
        return 'text-purple-600';
      case 'private':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesFolder = currentFolder === 'root' || resource.folder === currentFolder;
    return matchesSearch && matchesType && matchesFolder;
  });

  const currentFolderData = folders.find(f => f.id === currentFolder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resources Library</h2>
          <p className="text-gray-600">Manage and share your coaching resources with clients</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Upload size={20} />
          <span>Upload Resource</span>
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={() => setCurrentFolder('root')}
          className={`hover:text-purple-600 ${currentFolder === 'root' ? 'text-purple-600 font-medium' : 'text-gray-500'}`}
        >
          All Resources
        </button>
        {currentFolderData && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-purple-600 font-medium">{currentFolderData.name}</span>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">{resources.length}</div>
          <div className="text-gray-600">Total Resources</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">{folders.length}</div>
          <div className="text-gray-600">Categories</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {resources.reduce((acc, r) => acc + r.downloads, 0)}
          </div>
          <div className="text-gray-600">Total Downloads</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {resources.filter(r => r.accessLevel !== 'private').length}
          </div>
          <div className="text-gray-600">Shared Resources</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Folders (if in root) */}
      {currentFolder === 'root' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Resource Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 ${folder.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Folder size={24} />
                </div>
                <h4 className="font-medium mb-1">{folder.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{folder.description}</p>
                <p className="text-xs text-gray-500">{folder.itemCount} items</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {currentFolderData ? `${currentFolderData.name} Resources` : 'All Resources'}
            </h3>
            <div className="text-sm text-gray-500">
              {filteredResources.length} resources
            </div>
          </div>
        </div>

        {filteredResources.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              const AccessIcon = getAccessIcon(resource.accessLevel);
              
              return (
                <div key={resource.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TypeIcon size={24} className="text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-lg truncate">{resource.name}</h4>
                        <div className="flex items-center space-x-2 ml-4">
                          <AccessIcon size={16} className={getAccessColor(resource.accessLevel)} />
                          <span className={`text-sm ${getAccessColor(resource.accessLevel)}`}>
                            {resource.accessLevel === 'all' ? 'Public' :
                             resource.accessLevel === 'category' ? 'Category' :
                             resource.accessLevel === 'selected' ? 'Selected' : 'Private'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{resource.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>Size: {resource.size}</span>
                        <span>Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}</span>
                        <span>Downloads: {resource.downloads}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Shared with:</span>
                        {Array.isArray(resource.sharedWith) ? (
                          <div className="flex flex-wrap gap-1">
                            {resource.sharedWith.slice(0, 3).map((client, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {client}
                              </span>
                            ))}
                            {resource.sharedWith.length > 3 && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                +{resource.sharedWith.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {resource.sharedWith}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Download size={16} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Share2 size={16} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Edit size={16} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <File size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Upload New Resource</h3>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</h4>
                <p className="text-gray-500">Support for PDF, DOC, MP4, MP3, and more</p>
                <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Choose Files
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter resource name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Select category</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe this resource..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="private">Private (Only me)</option>
                  <option value="selected">Selected Clients</option>
                  <option value="category">All Clients in Category</option>
                  <option value="all">All Clients</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Upload Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesLibrary;