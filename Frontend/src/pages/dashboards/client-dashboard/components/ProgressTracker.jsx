import React, { useState } from 'react';
import { TrendingUp, Target, Award, Calendar, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const ProgressTracker = () => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const goals = [
    {
      id: 1,
      title: "Improve Work-Life Balance",
      description: "Achieve better balance between professional responsibilities and personal life",
      category: "Life Coaching",
      coach: "Dr. Emily Chen",
      startDate: "2024-12-01",
      targetDate: "2025-03-01",
      progress: 75,
      status: "on-track",
      milestones: [
        { id: 1, title: "Set clear work boundaries", completed: true, date: "2024-12-15" },
        { id: 2, title: "Establish evening routine", completed: true, date: "2024-12-28" },
        { id: 3, title: "Reduce overtime by 50%", completed: true, date: "2025-01-10" },
        { id: 4, title: "Plan weekly family activities", completed: false, date: "2025-01-25" },
        { id: 5, title: "Complete stress management course", completed: false, date: "2025-02-15" }
      ],
      metrics: [
        { name: "Weekly Work Hours", current: 45, target: 40, unit: "hrs" },
        { name: "Family Time", current: 15, target: 20, unit: "hrs/week" },
        { name: "Exercise Sessions", current: 3, target: 4, unit: "per week" }
      ]
    },
    {
      id: 2,
      title: "Career Advancement",
      description: "Develop leadership skills and secure promotion to senior manager role",
      category: "Career Development",
      coach: "Michael Rodriguez",
      startDate: "2024-11-15",
      targetDate: "2025-06-15",
      progress: 60,
      status: "on-track",
      milestones: [
        { id: 1, title: "Complete leadership assessment", completed: true, date: "2024-12-01" },
        { id: 2, title: "Enroll in management course", completed: true, date: "2024-12-15" },
        { id: 3, title: "Lead cross-functional project", completed: true, date: "2025-01-05" },
        { id: 4, title: "360-degree feedback review", completed: false, date: "2025-02-01" },
        { id: 5, title: "Present to executive team", completed: false, date: "2025-03-15" }
      ],
      metrics: [
        { name: "Leadership Courses", current: 2, target: 4, unit: "completed" },
        { name: "Team Projects Led", current: 1, target: 2, unit: "projects" },
        { name: "Mentoring Sessions", current: 6, target: 10, unit: "sessions" }
      ]
    },
    {
      id: 3,
      title: "Health & Wellness",
      description: "Establish sustainable healthy habits for improved energy and well-being",
      category: "Wellness Coaching",
      coach: "Sarah Williams",
      startDate: "2024-12-20",
      targetDate: "2025-04-20",
      progress: 40,
      status: "needs-attention",
      milestones: [
        { id: 1, title: "Create meal prep routine", completed: true, date: "2025-01-01" },
        { id: 2, title: "Join fitness program", completed: true, date: "2025-01-08" },
        { id: 3, title: "Establish sleep schedule", completed: false, date: "2025-01-20" },
        { id: 4, title: "Reduce stress eating", completed: false, date: "2025-02-10" },
        { id: 5, title: "Complete 5K run", completed: false, date: "2025-04-01" }
      ],
      metrics: [
        { name: "Weekly Workouts", current: 2, target: 4, unit: "sessions" },
        { name: "Sleep Hours", current: 6.5, target: 8, unit: "hrs/night" },
        { name: "Water Intake", current: 6, target: 8, unit: "glasses/day" }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'behind':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
              <div className="text-sm text-gray-500">Active Goals</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {goals.reduce((acc, goal) => acc + goal.milestones.filter(m => m.completed).length, 0)}
              </div>
              <div className="text-sm text-gray-500">Completed Milestones</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
              </div>
              <div className="text-sm text-gray-500">Average Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award size={24} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {goals.filter(g => g.status === 'on-track').length}
              </div>
              <div className="text-sm text-gray-500">On Track Goals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Goals</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              className="p-6 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium">{goal.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{goal.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>Coach: {goal.coach}</span>
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{goal.progress}%</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedGoal === goal.id && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Milestones */}
                    <div>
                      <h4 className="font-medium mb-3">Milestones</h4>
                      <div className="space-y-2">
                        {goal.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                              milestone.completed 
                                ? 'bg-green-500 flex items-center justify-center' 
                                : 'border-2 border-gray-300'
                            }`}>
                              {milestone.completed && (
                                <CheckCircle size={12} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={milestone.completed ? 'line-through text-gray-500' : ''}>
                                {milestone.title}
                              </div>
                              <div className="text-xs text-gray-400">
                                {milestone.completed ? 'Completed' : 'Due'}: {new Date(milestone.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div>
                      <h4 className="font-medium mb-3">Key Metrics</h4>
                      <div className="space-y-3">
                        {goal.metrics.map((metric, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{metric.name}</span>
                              <span>{metric.current}/{metric.target} {metric.unit}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;