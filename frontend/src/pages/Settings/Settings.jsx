"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { useTheme } from "@/context/theme-context";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserPreferencesMutation,
  useGetUserAvatarVariationsQuery,
  useGetUserStatsQuery,
} from "@/lib/slices/userSlice";
import { updateUserProfile } from "@/lib/slices/authSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Palette, Bell, Globe2, CalendarClock, User, Settings as SettingsIcon, BarChart3, Eye, EyeOff } from "lucide-react";

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const dateFormatOptions = [
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
];

const timezoneOptions = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Singapore",
  "Asia/Kolkata",
];

export default function Settings() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { setTheme } = useTheme();
  const { data: profileData, isLoading: profileLoading, isFetching } = useGetUserProfileQuery();
  const { data: statsData, isLoading: statsLoading } = useGetUserStatsQuery();
  const { data: avatarData, isError: avatarError } = useGetUserAvatarVariationsQuery(profileData?.name);
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [updatePreferences, { isLoading: isSavingPreferences }] = useUpdateUserPreferencesMutation();

  const preferences = useMemo(() => profileData?.preferences || {}, [profileData]);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar: "",
    password: "",
    confirmPassword: "",
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    theme: "light",
    notifications: {
      email: true,
      deadlineReminders: true,
      taskUpdates: true,
    },
    dateFormat: "DD/MM/YYYY",
    timezone: "UTC",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const avatarOptions = useMemo(() => {
    if (Array.isArray(avatarData?.variations) && avatarData.variations.length > 0) {
      return avatarData.variations.slice(0, 8);
    }
    if (profileForm.avatar) return [profileForm.avatar];
    if (profileData?.avatar) return [profileData.avatar];
    return [];
  }, [avatarData?.variations, profileData?.avatar, profileForm.avatar]);

  // Load profile data
  useEffect(() => {
    if (profileData) {
      setProfileForm({
        name: profileData.name || "",
        email: profileData.email || "",
        avatar: profileData.avatar || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [profileData]);

  // Sync latest preferences into global auth state so other areas (date/time formatting, theme) stay current
  useEffect(() => {
    if (profileData?.preferences) {
      dispatch(updateUserProfile({ preferences: profileData.preferences }));
    }
  }, [dispatch, profileData?.preferences]);

  // Load preferences data
  useEffect(() => {
    if (preferences && Object.keys(preferences).length > 0) {
      const nextSettings = {
        theme: preferences.theme || "light",
        notifications: {
          email: preferences.notifications?.email ?? true,
          deadlineReminders: preferences.notifications?.deadlineReminders ?? true,
          taskUpdates: preferences.notifications?.taskUpdates ?? true,
        },
        dateFormat: preferences.dateFormat || "DD/MM/YYYY",
        timezone: preferences.timezone || "UTC",
      };
      setSettingsForm(nextSettings);

      // Keep ThemeProvider in sync with saved preference on load
      if (nextSettings.theme) {
        setTheme(nextSettings.theme);
      }
    }
  }, [preferences, setTheme]);

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords if provided
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      enqueueSnackbar("Passwords do not match.", { variant: "error" });
      return;
    }

    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        avatar: profileForm.avatar,
      };

      if (profileForm.password) {
        payload.password = profileForm.password;
      }

      const response = await updateProfile(payload).unwrap();
      dispatch(updateUserProfile(response));
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
      setProfileForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      enqueueSnackbar(
        err?.data?.message || err?.message || "Unable to update profile right now.",
        { variant: "error" }
      );
    }
  };

  // Handle settings form submission
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        theme: settingsForm.theme,
        notifications: {
          email: settingsForm.notifications.email,
          deadlineReminders: settingsForm.notifications.deadlineReminders,
          taskUpdates: settingsForm.notifications.taskUpdates,
        },
        dateFormat: settingsForm.dateFormat,
        timezone: settingsForm.timezone,
      };

      const response = await updatePreferences(payload).unwrap();
      if (response?.preferences) {
        dispatch(updateUserProfile({ preferences: response.preferences }));
      }

      // Apply theme change immediately to UI
      setTheme(settingsForm.theme);

      enqueueSnackbar("Preferences updated successfully!", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        err?.data?.message || err?.message || "Unable to save preferences right now.",
        { variant: "error" }
      );
    }
  };

  const handleCheckboxChange = (field) => (checked) => {
    setSettingsForm((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: !!checked },
    }));
  };

  const isBusy = profileLoading || isFetching;
  const isUpdating = isUpdatingProfile || isSavingPreferences;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Account Profile and Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Profile Information Card */}
            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and avatar.
                    </CardDescription>
                  </div>
                  {profileData?.isAdmin && (
                    <Badge variant="outline" className="bg-primary/10">
                      Admin
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profileForm.avatar} alt={profileForm.name} />
                    <AvatarFallback className="text-lg">
                      {profileForm.name?.substring(0, 2)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar">Avatar</Label>
                    <div className="grid grid-cols-4 gap-2 max-w-64">
                      {avatarOptions.map((avatar, index) => (
                        <Avatar
                          key={index}
                          className={`h-10 w-10 cursor-pointer border-2 transition-colors ${
                            profileForm.avatar === avatar
                              ? "border-primary"
                              : "border-transparent hover:border-border"
                          }`}
                          onClick={() => setProfileForm(prev => ({ ...prev, avatar }))}
                        >
                          <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                          <AvatarFallback>{profileForm.name?.substring(0, 2)?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose an avatar or keep your current one.
                    </p>
                    {avatarError && (
                      <p className="text-xs text-amber-600">
                        Unable to load new avatar options right now. Using your current avatar.
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      disabled={isBusy || isUpdating}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isBusy || isUpdating}
                      required
                    />
                  </div>
                </div>

                {/* Password Change */}
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Change Password</h4>
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep your current password.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={profileForm.password}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                          disabled={isBusy || isUpdating}
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={profileForm.confirmPassword}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          disabled={isBusy || isUpdating}
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics Card */}
            {statsData && (
              <Card className="border-border/60 bg-card/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Account Statistics
                  </CardTitle>
                  <CardDescription>
                    Your activity overview on Taskly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Tasks</p>
                      <p className="text-2xl font-semibold">{statsData.stats?.totalTasks || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-semibold text-green-600">{statsData.stats?.completedTasks || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-semibold text-blue-600">{statsData.stats?.inProgressTasks || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-semibold">{statsData.stats?.completionRate || 0}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Last updated: {new Date(statsData.generatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (profileData) {
                      setProfileForm({
                        name: profileData.name || "",
                        email: profileData.email || "",
                        avatar: profileData.avatar || "",
                        password: "",
                        confirmPassword: "",
                      });
                    }
                  }}
                  disabled={isBusy || isUpdating}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isBusy || isUpdating}>
                  {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            {/* Appearance Card */}
            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Choose how Taskly looks across your devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settingsForm.theme}
                      onValueChange={(value) =>
                        setSettingsForm((prev) => ({ ...prev, theme: value }))
                      }
                      disabled={isBusy || isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settingsForm.dateFormat}
                      onValueChange={(value) =>
                        setSettingsForm((prev) => ({ ...prev, dateFormat: value }))
                      }
                      disabled={isBusy || isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    list="timezone-options"
                    value={settingsForm.timezone}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                    disabled={isBusy || isUpdating}
                  />
                  <datalist id="timezone-options">
                    {timezoneOptions.map((tz) => (
                      <option key={tz} value={tz} />
                    ))}
                  </datalist>
                  <p className="text-xs text-muted-foreground">
                    Use a standard IANA timezone (e.g., UTC, America/New_York).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Control reminders and updates delivered to your email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="email"
                      checked={settingsForm.notifications.email}
                      onCheckedChange={handleCheckboxChange("email")}
                      disabled={isBusy || isUpdating}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm font-medium leading-none">
                        Email notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive updates about your tasks and account.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="deadlineReminders"
                      checked={settingsForm.notifications.deadlineReminders}
                      onCheckedChange={handleCheckboxChange("deadlineReminders")}
                      disabled={isBusy || isUpdating}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="deadlineReminders" className="text-sm font-medium leading-none">
                        Deadline reminders
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get nudges before tasks are due.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="taskUpdates"
                      checked={settingsForm.notifications.taskUpdates}
                      onCheckedChange={handleCheckboxChange("taskUpdates")}
                      disabled={isBusy || isUpdating}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="taskUpdates" className="text-sm font-medium leading-none">
                        Task updates
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when task details change.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (preferences) {
                      setSettingsForm({
                        theme: preferences.theme || "light",
                        notifications: {
                          email: preferences.notifications?.email ?? true,
                          deadlineReminders: preferences.notifications?.deadlineReminders ?? true,
                          taskUpdates: preferences.notifications?.taskUpdates ?? true,
                        },
                        dateFormat: preferences.dateFormat || "DD/MM/YYYY",
                        timezone: preferences.timezone || "UTC",
                      });
                    }
                  }}
                  disabled={isBusy || isUpdating}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isBusy || isUpdating}>
                  {isSavingPreferences && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
