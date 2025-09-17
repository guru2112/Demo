'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, User, Camera, Upload, AlertCircle, CheckCircle, Eye, Edit } from 'lucide-react';

interface StudentData {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  year: number;
  division: string;
  contactInfo?: {
    phone?: string;
    address?: string;
  };
  faceEmbedding?: number[];
  isActive: boolean;
}

export default function UpdateStudent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
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
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage({ type: 'error', text: 'Please enter a student ID to search' });
      return;
    }

    setSearchLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/teacher/search-student?q=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();

      if (response.ok) {
        setSearchResults(result.students || []);
        if (result.students.length === 0) {
          setMessage({ type: 'error', text: 'No students found matching your search' });
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Search failed' });
        setSearchResults([]);
      }
    } catch {
      setMessage({ type: 'error', text: 'Search failed. Please try again.' });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year.toString(),
      division: student.division,
      phone: student.contactInfo?.phone || '',
      address: student.contactInfo?.address || ''
    });
    setIsEditing(false);
    setMessage(null);
    setImageFile(null);
    setImagePreview(null);
  };

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
    if (!selectedStudent) return;

    setLoading(true);
    setMessage(null);

    try {
      // Update profile data
      const updateResponse = await fetch('/api/teacher/update-student', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
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
      if (imageFile && selectedStudent.studentId) {
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
                studentId: selectedStudent.studentId,
              }),
            });

            const faceResult = await faceResponse.json();

            if (faceResponse.ok) {
              setMessage({ 
                type: 'success', 
                text: 'Student profile and face data updated successfully!' 
              });
            } else {
              setMessage({ 
                type: 'error', 
                text: faceResult.error || 'Profile updated but face registration failed.' 
              });
            }
          } catch {
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
          text: 'Student profile updated successfully!' 
        });
        setLoading(false);
      }

      // Update selected student data
      setSelectedStudent({ ...selectedStudent, ...updateResult.user });
      setIsEditing(false);

    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Update failed' });
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Update Student Details</h2>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Student by ID or Name
                </label>
                <input
                  type="text"
                  placeholder="Enter student ID or name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2 inline" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border border-gray-200 rounded-md">
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => selectStudent(student)}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                          <p className="text-sm text-gray-600">
                            {student.department} - Year {student.year}, Division {student.division}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {student.faceEmbedding && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Face Registered
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            student.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

          {/* Student Details */}
          {selectedStudent && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Student Details</h3>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        selectStudent(selectedStudent); // Reset form
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student ID (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={selectedStudent.studentId}
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
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
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
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
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
                      disabled={!isEditing}
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
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
                      disabled={!isEditing}
                      value={formData.year}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
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
                      disabled={!isEditing}
                      value={formData.division}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
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
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
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
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isEditing 
                        ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500' 
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  />
                </div>

                {/* Face Image Update (only in edit mode) */}
                {isEditing && (
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
                )}

                {isEditing && (
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
                      {loading ? 'Updating...' : 'Update Student'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}