import React, { useState } from 'react';
import { Plus, X, Target, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const GoalsSection = ({ data, errors, updateData, updateNestedData, setUnsavedChanges }) => {
  const [newShortTermGoal, setNewShortTermGoal] = useState('');
  const [newLongTermGoal, setNewLongTermGoal] = useState('');

  const goalSuggestions = {
    shortTerm: [
      'Improve work-life balance',
      'Develop better communication skills',
      'Build confidence in public speaking',
      'Create a morning routine',
      'Set clearer boundaries',
      'Improve time management',
      'Reduce stress levels',
      'Build networking skills'
    ],
    longTerm: [
      'Advance to leadership position',
      'Start my own business',
      'Achieve financial independence',
      'Develop emotional intelligence',
      'Build a personal brand',
      'Create multiple income streams',
      'Become a mentor to others',
      'Achieve work-life integration'
    ]
  };

  // Short-term Goals Management
  const addShortTermGoal = () => {
    if (newShortTermGoal?.trim()) {
      const updatedGoals = [...(data?.shortTermGoals || []), { 
        id: Date.now(), 
        text: newShortTermGoal?.trim(),
        completed: false,
        createdAt: new Date()?.toISOString()
      }];
      updateData('shortTermGoals', updatedGoals);
      setNewShortTermGoal('');
      setUnsavedChanges(true);
    }
  };

  const removeShortTermGoal = (id) => {
    const updatedGoals = data?.shortTermGoals?.filter(goal => goal?.id !== id) || [];
    updateData('shortTermGoals', updatedGoals);
    setUnsavedChanges(true);
  };

  const toggleShortTermGoal = (id) => {
    const updatedGoals = data?.shortTermGoals?.map(goal => 
      goal?.id === id ? { ...goal, completed: !goal?.completed } : goal
    ) || [];
    updateData('shortTermGoals', updatedGoals);
    setUnsavedChanges(true);
  };

  const addSuggestedShortTermGoal = (goalText) => {
    if (!data?.shortTermGoals?.some(goal => goal?.text === goalText)) {
      const updatedGoals = [...(data?.shortTermGoals || []), { 
        id: Date.now(), 
        text: goalText,
        completed: false,
        createdAt: new Date()?.toISOString()
      }];
      updateData('shortTermGoals', updatedGoals);
      setUnsavedChanges(true);
    }
  };

  // Long-term Goals Management
  const addLongTermGoal = () => {
    if (newLongTermGoal?.trim()) {
      const updatedGoals = [...(data?.longTermGoals || []), { 
        id: Date.now(), 
        text: newLongTermGoal?.trim(),
        completed: false,
        createdAt: new Date()?.toISOString()
      }];
      updateData('longTermGoals', updatedGoals);
      setNewLongTermGoal('');
      setUnsavedChanges(true);
    }
  };

  const removeLongTermGoal = (id) => {
    const updatedGoals = data?.longTermGoals?.filter(goal => goal?.id !== id) || [];
    updateData('longTermGoals', updatedGoals);
    setUnsavedChanges(true);
  };

  const toggleLongTermGoal = (id) => {
    const updatedGoals = data?.longTermGoals?.map(goal => 
      goal?.id === id ? { ...goal, completed: !goal?.completed } : goal
    ) || [];
    updateData('longTermGoals', updatedGoals);
    setUnsavedChanges(true);
  };

  const addSuggestedLongTermGoal = (goalText) => {
    if (!data?.longTermGoals?.some(goal => goal?.text === goalText)) {
      const updatedGoals = [...(data?.longTermGoals || []), { 
        id: Date.now(), 
        text: goalText,
        completed: false,
        createdAt: new Date()?.toISOString()
      }];
      updateData('longTermGoals', updatedGoals);
      setUnsavedChanges(true);
    }
  };

  // Progress Tracking
  const updateProgressTracking = (enabled) => {
    updateData('progressTracking', enabled);
    setUnsavedChanges(true);
  };

  // Coaching History
  const updateCoachingHistory = (value) => {
    updateData('coachingHistory', value);
    setUnsavedChanges(true);
  };

  return (
    <div className="space-y-8">
      {/* Short-term Goals */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Short-term Goals</h3>
        </div>
        <p className="text-sm text-gray-600">
          Goals you'd like to achieve in the next 3-6 months with your coach's help.
        </p>
        
        {/* Current Short-term Goals */}
        <div className="space-y-3">
          {data?.shortTermGoals?.map((goal) => (
            <div 
              key={goal?.id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 flex-1">
                <button
                  onClick={() => toggleShortTermGoal(goal?.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    goal?.completed 
                      ? 'bg-green-500 border-green-500 text-white' :'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {goal?.completed && <CheckCircle className="w-3 h-3" />}
                </button>
                <span className={`${goal?.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {goal?.text}
                </span>
              </div>
              <button
                onClick={() => removeShortTermGoal(goal?.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Short-term Goal */}
        <div className="flex space-x-2">
          <Input
            value={newShortTermGoal}
            onChange={(e) => setNewShortTermGoal(e?.target?.value)}
            placeholder="Add a short-term goal (e.g., Improve communication skills)"
            className="flex-1"
            onKeyPress={(e) => e?.key === 'Enter' && addShortTermGoal()}
          />
          <Button
            onClick={addShortTermGoal}
            disabled={!newShortTermGoal?.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Suggested Short-term Goals */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Popular short-term goals:</p>
          <div className="flex flex-wrap gap-2">
            {goalSuggestions?.shortTerm?.filter(suggestion => !data?.shortTermGoals?.some(goal => goal?.text === suggestion))?.slice(0, 6)?.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => addSuggestedShortTermGoal(suggestion)}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
          </div>
        </div>
      </div>
      {/* Long-term Goals */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Long-term Goals</h3>
        </div>
        <p className="text-sm text-gray-600">
          Bigger goals you'd like to work towards over 6 months to several years.
        </p>
        
        {/* Current Long-term Goals */}
        <div className="space-y-3">
          {data?.longTermGoals?.map((goal) => (
            <div 
              key={goal?.id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 flex-1">
                <button
                  onClick={() => toggleLongTermGoal(goal?.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    goal?.completed 
                      ? 'bg-green-500 border-green-500 text-white' :'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {goal?.completed && <CheckCircle className="w-3 h-3" />}
                </button>
                <span className={`${goal?.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {goal?.text}
                </span>
              </div>
              <button
                onClick={() => removeLongTermGoal(goal?.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Long-term Goal */}
        <div className="flex space-x-2">
          <Input
            value={newLongTermGoal}
            onChange={(e) => setNewLongTermGoal(e?.target?.value)}
            placeholder="Add a long-term goal (e.g., Start my own business)"
            className="flex-1"
            onKeyPress={(e) => e?.key === 'Enter' && addLongTermGoal()}
          />
          <Button
            onClick={addLongTermGoal}
            disabled={!newLongTermGoal?.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Suggested Long-term Goals */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Popular long-term goals:</p>
          <div className="flex flex-wrap gap-2">
            {goalSuggestions?.longTerm?.filter(suggestion => !data?.longTermGoals?.some(goal => goal?.text === suggestion))?.slice(0, 6)?.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => addSuggestedLongTermGoal(suggestion)}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
          </div>
        </div>
      </div>
      {/* Progress Tracking */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
        
        <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data?.progressTracking ?? true}
            onChange={(e) => updateProgressTracking(e?.target?.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div>
            <p className="font-medium text-gray-900">Enable Progress Tracking</p>
            <p className="text-sm text-gray-600 mt-1">
              Allow your coach to track your progress towards goals and provide regular updates.
              This helps maintain accountability and celebrate achievements.
            </p>
          </div>
        </label>

        {data?.progressTracking && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Progress Tracking Benefits</p>
            </div>
            <ul className="text-sm text-blue-800 space-y-1 ml-6">
              <li>• Regular check-ins on goal progress</li>
              <li>• Visual progress charts and insights</li>
              <li>• Celebration of milestones achieved</li>
              <li>• Adjustments to goals as needed</li>
            </ul>
          </div>
        )}
      </div>
      {/* Coaching History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Previous Coaching Experience</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell us about your previous coaching experience (optional)
          </label>
          <textarea
            value={data?.coachingHistory || ''}
            onChange={(e) => updateCoachingHistory(e?.target?.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Have you worked with a coach before? What worked well? What didn't? Any specific approaches or techniques you prefer? This helps us match you with the right coach..."
          />
          <p className="text-xs text-gray-500 mt-2">
            This information helps coaches understand your background and tailor their approach.
          </p>
        </div>
      </div>
      {/* Goals Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Your Goals Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Short-term Goals ({data?.shortTermGoals?.length || 0})</h5>
            <div className="space-y-1">
              {data?.shortTermGoals?.slice(0, 3)?.map((goal) => (
                <p key={goal?.id} className="text-sm text-gray-600 flex items-center space-x-2">
                  <span className={goal?.completed ? '✅' : '⏳'} />
                  <span>{goal?.text}</span>
                </p>
              ))}
              {(data?.shortTermGoals?.length || 0) > 3 && (
                <p className="text-xs text-gray-500">+ {(data?.shortTermGoals?.length || 0) - 3} more</p>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Long-term Goals ({data?.longTermGoals?.length || 0})</h5>
            <div className="space-y-1">
              {data?.longTermGoals?.slice(0, 3)?.map((goal) => (
                <p key={goal?.id} className="text-sm text-gray-600 flex items-center space-x-2">
                  <span className={goal?.completed ? '✅' : '🎯'} />
                  <span>{goal?.text}</span>
                </p>
              ))}
              {(data?.longTermGoals?.length || 0) > 3 && (
                <p className="text-xs text-gray-500">+ {(data?.longTermGoals?.length || 0) - 3} more</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>Progress Tracking:</strong> {data?.progressTracking ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Previous Experience:</strong> {data?.coachingHistory ? 'Provided' : 'None specified'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalsSection;