// src/pages/ProfilePage.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Camera,
  Edit3,
  Save,
  Mail,
  MapPin,
  Calendar,
  Palette,
  Heart,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: "Jane Doe",
    email: "jane.doe@example.com",
    bio: "Fashion enthusiast who loves mixing classic and modern styles.",
    location: "San Francisco, CA",
    joinDate: "2024-01-15",
    avatar: "/api/placeholder/150/150",
    stylePreferences: ["minimalist", "classic", "casual"],
    favoriteColors: ["navy", "white", "beige", "black"],
    stats: {
      totalItems: 47,
      outfitsCreated: 23,
      recommendations: 156,
    },
  });

  const handleSave = () => {
    // TODO: Implement save profile functionality
    setIsEditing(false);
    console.log("Save profile:", profile);
  };

  const handleAvatarChange = () => {
    // TODO: Implement avatar upload functionality
    console.log("Change avatar");
  };

  const availableStyles = [
    "minimalist",
    "classic",
    "casual",
    "formal",
    "bohemian",
    "edgy",
    "romantic",
    "vintage",
    "modern",
    "sporty",
  ];

  const availableColors = [
    "black",
    "white",
    "navy",
    "gray",
    "beige",
    "brown",
    "red",
    "blue",
    "green",
    "yellow",
    "pink",
    "purple",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and style preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full p-1 h-8 w-8"
                        onClick={handleAvatarChange}
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={profile.displayName}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            displayName: e.target.value,
                          })
                        }
                        className="text-lg font-semibold"
                      />
                    ) : (
                      <h2 className="text-lg font-semibold">
                        {profile.displayName}
                      </h2>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Style Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Style Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Preferred Styles
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableStyles.map((style) => (
                      <Badge
                        key={style}
                        variant={
                          profile.stylePreferences.includes(style)
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer ${
                          isEditing ? "hover:bg-blue-100" : ""
                        }`}
                        onClick={() => {
                          if (isEditing) {
                            const newPreferences =
                              profile.stylePreferences.includes(style)
                                ? profile.stylePreferences.filter(
                                    (s) => s !== style
                                  )
                                : [...profile.stylePreferences, style];
                            setProfile({
                              ...profile,
                              stylePreferences: newPreferences,
                            });
                          }
                        }}
                      >
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Favorite Colors</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <Badge
                        key={color}
                        variant={
                          profile.favoriteColors.includes(color)
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer ${
                          isEditing ? "hover:bg-blue-100" : ""
                        }`}
                        onClick={() => {
                          if (isEditing) {
                            const newColors = profile.favoriteColors.includes(
                              color
                            )
                              ? profile.favoriteColors.filter(
                                  (c) => c !== color
                                )
                              : [...profile.favoriteColors, color];
                            setProfile({
                              ...profile,
                              favoriteColors: newColors,
                            });
                          }
                        }}
                      >
                        <div
                          className={`w-3 h-3 rounded-full mr-1 bg-${color}-500`}
                        />
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.stats.totalItems}
                  </div>
                  <div className="text-sm text-gray-600">Items in Wardrobe</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.stats.outfitsCreated}
                  </div>
                  <div className="text-sm text-gray-600">Outfits Created</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {profile.stats.recommendations}
                  </div>
                  <div className="text-sm text-gray-600">
                    AI Recommendations
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since:</span>
                    <span>
                      {new Date(profile.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <Badge variant="outline">Free</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
