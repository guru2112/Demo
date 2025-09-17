'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { User, Camera, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  department?: string;
  year?: number;
  division?: string;
  contactInfo?: {
    phone?: string;
    address?: string;
  };
}

export default function UpdateProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    division: '',
    phone: '',
    address: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        department: parsedUser.department || '',
        year: parsedUser.year?.toString() || '',
        division: parsedUser.division || '',
        phone: parsedUser.contactInfo?.phone || '',
        address: parsedUser.contactInfo?.address || ''
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Update profile data
      const updateResponse = await fetch('/api/student/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          name: formData.name,
          email: formData.email,
          department: formData.department,
          year: parseInt(formData.year),
          division: formData.division,
          contactInfo: {
            phone: formData.phone,
            address: formData.address
          }
        }),
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateResult.error || 'Profile update failed');
      }

      // Update face data if image is provided
      if (imageFile && user.studentId) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Image = reader.result as string;
            
            const faceResponse = await fetch('/api/face/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64Image,
                studentId: user.studentId,
              }),
            });

            const faceResult = await faceResponse.json();

            if (faceResponse.ok) {
              setMessage({ 
                type: 'success', 
                text: 'Profile and face data updated successfully!' 
              });
            } else {
              setMessage({ 
                type: 'error', 
                text: faceResult.error || 'Profile updated but face registration failed.' 
              });
            }
          } catch (error) {
            setMessage({ 
              type: 'error', 
              text: 'Profile updated but face registration failed.' 
            });
          } finally {
            setLoading(false);
          }
        };
        reader.readAsDataURL(imageFile);
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
        setLoading(false);
      }

      // Update localStorage with new data
      const updatedUser = { ...user, ...updateResult.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Update failed' });
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout userRole="student">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Update Profile</h2>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student ID (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={user.studentId || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  id="year"
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
                  Division *
                </label>
                <input
                  type="text"
                  id="division"
                  name="division"
                  required
                  value={formData.division}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Face Image Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Face Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Face preview"
                      className="w-32 h-32 object-cover rounded-lg mb-4"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Face Image
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG up to 10MB. Leave empty to keep current face data.
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Image
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}