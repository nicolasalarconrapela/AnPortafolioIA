import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { ProfileCard } from './ProfileCard';
import { Spinner } from '@/shared/ui/Spinner';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { data: profile, isLoading, error } = useProfile();
    const updateProfile = useUpdateProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', bio: '' });

    if (isLoading) return <Spinner />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error al cargar perfil</p>
                    <button onClick={() => navigate('/')} className="btn btn--outline">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const handleEdit = () => {
        setEditData({ name: profile.name, bio: profile.bio || '' });
        setIsEditing(true);
    };

    const handleSave = () => {
        updateProfile.mutate(editData, {
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate(-1)} className="btn btn--outline mb-6">
                    ← Back
                </button>

                {!isEditing ? (
                    <ProfileCard profile={profile} onEdit={handleEdit} />
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Bio</label>
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={updateProfile.isPending}
                                    className="btn btn--primary"
                                >
                                    {updateProfile.isPending ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="btn btn--outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
