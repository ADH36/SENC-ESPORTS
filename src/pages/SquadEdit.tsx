import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSquadStore } from '../stores/squadStore';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { ArrowLeft, Save, X } from 'lucide-react';

interface SquadFormData {
  name: string;
  description: string;
  game: string;
  logoUrl: string;
  isRecruiting: boolean;
}

const SquadEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSquad, fetchSquadById, updateSquad, isLoading, error } = useSquadStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<SquadFormData>({
    name: '',
    description: '',
    game: '',
    logoUrl: '',
    isRecruiting: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchSquadById(id);
    }
  }, [id, fetchSquadById]);

  useEffect(() => {
    if (currentSquad) {
      setFormData({
        name: currentSquad.name || '',
        description: currentSquad.description || '',
        game: currentSquad.game || '',
        logoUrl: currentSquad.logoUrl || '',
        isRecruiting: currentSquad.isRecruiting || false
      });
    }
  }, [currentSquad]);

  // Authentication check - squad captain or admin can edit
  useEffect(() => {
    if (currentSquad && user) {
      const isSquadCaptain = currentSquad.captainId === user.id;
      const isAdmin = user.role === 'admin';
      
      if (!isSquadCaptain && !isAdmin) {
        toast.error('You are not authorized to edit this squad');
        navigate(`/squads/${id}`);
      }
    }
  }, [currentSquad, user, id, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Squad name is required';
    }
    
    if (!formData.game.trim()) {
      errors.game = 'Game is required';
    }
    
    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    if (!id) {
      toast.error('Squad ID is missing');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateSquad(id, formData);
      toast.success('Squad updated successfully!');
      navigate(`/squads/${id}`);
    } catch (error) {
      console.error('Error updating squad:', error);
      toast.error('Failed to update squad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/squads/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading squad details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!currentSquad) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Squad not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Squad
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Squad</h1>
          <p className="text-gray-400 mt-2">Update your squad information</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Squad Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Squad Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Squad Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter squad name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
                )}
              </div>

              {/* Game */}
              <div>
                <label htmlFor="game" className="block text-sm font-medium text-gray-300 mb-2">
                  Game *
                </label>
                <input
                  type="text"
                  id="game"
                  name="game"
                  value={formData.game}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.game ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter game name"
                />
                {validationErrors.game && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.game}</p>
                )}
              </div>

              {/* Logo URL */}
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.logoUrl ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="https://example.com/logo.png"
                />
                {validationErrors.logoUrl && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.logoUrl}</p>
                )}
              </div>

              {/* Is Recruiting */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecruiting"
                  name="isRecruiting"
                  checked={formData.isRecruiting}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="isRecruiting" className="ml-2 text-sm font-medium text-gray-300">
                  Currently recruiting new members
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter squad description..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SquadEdit;