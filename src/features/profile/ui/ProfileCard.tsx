import React from 'react';
import type { Profile } from '../model/types';

interface ProfileCardProps {
    profile: Profile;
    onEdit?: () => void;
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={profile.avatarUrl || '/default-avatar.png'}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                    <span className="text-sm text-gray-500 capitalize">{profile.role}</span>
                </div>
            </div>

            {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
            )}

            {onEdit && (
                <button onClick={onEdit} className="btn btn--primary">
                    Edit Profile
                </button>
            )}
        </div>
    );
}
